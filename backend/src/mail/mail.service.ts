import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

const PRIMARY = '#1B5E20';

interface DatosCorreo {
  correo: string;
  nombre: string;
  eventoId: number;
  descripcion?: string | null;
  fotoPath?: string | null;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporterPromise: Promise<nodemailer.Transporter | null> | null = null;
  private usandoCuentaPrueba = false;

  private getTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.transporterPromise) return this.transporterPromise;
    this.transporterPromise = this.crearTransporter();
    return this.transporterPromise;
  }

  private async crearTransporter(): Promise<nodemailer.Transporter | null> {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // SMTP real configurado (Gmail, etc.): entrega a bandejas reales.
    if (host && user && pass) {
      this.logger.log(`SMTP real configurado (${host}). Los correos se entregaran a bandejas reales.`);
      return nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
    }

    // Sin SMTP real: buzon de prueba Ethereal. Los correos NO llegan a la
    // bandeja del ciudadano, pero se envian de verdad y se genera un link de
    // vista previa en la consola para verlos (util para demo/desarrollo).
    try {
      const cuenta = await nodemailer.createTestAccount();
      this.usandoCuentaPrueba = true;
      this.logger.warn(
        `SMTP real no configurado: usando cuenta de prueba Ethereal (${cuenta.user}). ` +
          'Cada correo tendra un link de vista previa en la consola.',
      );
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: cuenta.user, pass: cuenta.pass },
      });
    } catch (err) {
      this.logger.error(`No se pudo crear la cuenta de correo de prueba: ${(err as Error).message}`);
      return null;
    }
  }

  private resolverAdjunto(adjuntoPath?: string | null): { filename: string; abs: string } | null {
    if (!adjuntoPath) return null;
    const abs = join(process.cwd(), adjuntoPath);
    if (!existsSync(abs)) return null;
    return { filename: 'evidencia' + (abs.match(/\.\w+$/)?.[0] ?? '.jpg'), abs };
  }

  /**
   * Envia via Resend (API HTTP). Funciona en Render (que bloquea el SMTP).
   * Devuelve true si se encargo del envio (haya salido bien o mal).
   */
  private async enviarPorResend(
    to: string,
    subject: string,
    html: string,
    adjuntoPath?: string | null,
  ): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return false;

    const from = process.env.RESEND_FROM ?? 'Desagües Cuenca <onboarding@resend.dev>';
    const adjunto = this.resolverAdjunto(adjuntoPath);
    const body: Record<string, unknown> = { from, to, subject, html };
    if (adjunto) {
      body.attachments = [
        { filename: adjunto.filename, content: readFileSync(adjunto.abs).toString('base64') },
      ];
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        this.logger.log(`Correo enviado (Resend) a ${to}: ${subject}`);
      } else {
        const detalle = await res.text();
        this.logger.error(`Resend rechazo el correo a ${to}: ${res.status} ${detalle}`);
      }
    } catch (err) {
      this.logger.error(`Error llamando a Resend para ${to}: ${(err as Error).message}`);
    }
    return true;
  }

  /** Envia un correo sin bloquear ni romper la peticion si algo falla. */
  private async enviar(to: string, subject: string, html: string, adjuntoPath?: string | null) {
    // Preferir Resend (HTTP) si esta configurado: es lo que funciona en Render.
    if (await this.enviarPorResend(to, subject, html, adjuntoPath)) return;

    const transporter = await this.getTransporter();
    if (!transporter) return;

    const attachments: nodemailer.SendMailOptions['attachments'] = [];
    if (adjuntoPath) {
      const abs = join(process.cwd(), adjuntoPath);
      if (existsSync(abs)) {
        attachments.push({ filename: 'evidencia' + (abs.match(/\.\w+$/)?.[0] ?? '.jpg'), path: abs });
      }
    }

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM ?? `Desagues Cuenca <${process.env.SMTP_USER ?? 'no-reply@desagues-cuenca.ec'}>`,
        to,
        subject,
        html,
        attachments,
      });
      this.logger.log(`Correo enviado a ${to}: ${subject}`);
      if (this.usandoCuentaPrueba) {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) this.logger.log(`Vista previa del correo: ${preview}`);
      }
    } catch (err) {
      this.logger.error(`No se pudo enviar el correo a ${to}: ${(err as Error).message}`);
    }
  }

  private plantilla(nombre: string, titulo: string, mensaje: string, badge: string, badgeColor: string, extra = '') {
    return `
    <div style="font-family:Segoe UI,Roboto,Arial,sans-serif;background:#f5f5f5;padding:24px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #eee;">
        <div style="background:${PRIMARY};color:#fff;padding:20px 24px;">
          <h1 style="margin:0;font-size:18px;">💧 Desagües Cuenca</h1>
        </div>
        <div style="padding:24px;color:#333;">
          <p style="margin:0 0 12px;">Hola <strong>${nombre}</strong>,</p>
          <span style="display:inline-block;background:${badgeColor};color:#fff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:12px;">${badge}</span>
          <h2 style="font-size:16px;color:${PRIMARY};margin:8px 0;">${titulo}</h2>
          <p style="margin:0 0 12px;line-height:1.5;">${mensaje}</p>
          ${extra}
          <p style="margin:20px 0 0;font-size:12px;color:#888;">Este es un mensaje automático del sistema de gestión de desagües de Cuenca. Por favor no respondas a este correo.</p>
        </div>
      </div>
    </div>`;
  }

  async reporteCreado(d: DatosCorreo) {
    const extra = d.descripcion
      ? `<p style="margin:0 0 12px;padding:12px;background:#f6ffed;border-left:3px solid ${PRIMARY};border-radius:4px;"><em>"${d.descripcion}"</em></p>`
      : '';
    const html = this.plantilla(
      d.nombre,
      `Reporte #${d.eventoId} recibido`,
      'Recibimos tu reporte de desagüe obstruido. El equipo técnico lo revisará y te avisaremos cuando comience la reparación.',
      'PENDIENTE',
      '#f57c00',
      extra,
    );
    await this.enviar(d.correo, `Reporte #${d.eventoId} recibido — Desagües Cuenca`, html);
  }

  async reparacionIniciada(d: DatosCorreo) {
    const html = this.plantilla(
      d.nombre,
      `Reparación del reporte #${d.eventoId} en proceso`,
      'Buenas noticias: una cuadrilla técnica ha comenzado a trabajar en el desagüe que reportaste. Te notificaremos cuando el trabajo esté terminado.',
      'EN PROCESO',
      '#1565c0',
    );
    await this.enviar(d.correo, `Reparación del reporte #${d.eventoId} en proceso — Desagües Cuenca`, html);
  }

  async reporteResuelto(d: DatosCorreo) {
    const extra = d.fotoPath
      ? '<p style="margin:0 0 12px;">Adjuntamos una foto de la evidencia del trabajo realizado.</p>'
      : '';
    const html = this.plantilla(
      d.nombre,
      `Reporte #${d.eventoId} resuelto`,
      '¡El desagüe que reportaste ya fue reparado! Gracias por ayudarnos a mantener Cuenca libre de inundaciones. 💧',
      'RESUELTO',
      PRIMARY,
      extra,
    );
    await this.enviar(d.correo, `Reporte #${d.eventoId} resuelto — Desagües Cuenca`, html, d.fotoPath);
  }
}
