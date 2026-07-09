import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';
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
  private transporter: nodemailer.Transporter | null = null;
  private inicializado = false;

  private getTransporter(): nodemailer.Transporter | null {
    if (this.inicializado) return this.transporter;
    this.inicializado = true;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP no configurado (SMTP_HOST/SMTP_USER/SMTP_PASS). No se enviaran correos.');
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
    return this.transporter;
  }

  /** Envia un correo sin bloquear ni romper la peticion si algo falla. */
  private async enviar(to: string, subject: string, html: string, adjuntoPath?: string | null) {
    const transporter = this.getTransporter();
    if (!transporter) return;

    const attachments: nodemailer.SendMailOptions['attachments'] = [];
    if (adjuntoPath) {
      const abs = join(process.cwd(), adjuntoPath);
      if (existsSync(abs)) {
        attachments.push({ filename: 'evidencia' + (abs.match(/\.\w+$/)?.[0] ?? '.jpg'), path: abs });
      }
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? `Desagues Cuenca <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments,
      });
      this.logger.log(`Correo enviado a ${to}: ${subject}`);
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
