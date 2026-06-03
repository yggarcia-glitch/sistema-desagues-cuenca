-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ciudadano', 'tecnico', 'admin');

-- CreateEnum
CREATE TYPE "TipoDesague" AS ENUM ('sumidero', 'alcantarilla', 'cuneta');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('alta', 'media', 'baja');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('pendiente', 'en_proceso', 'resuelto');

-- CreateEnum
CREATE TYPE "ResultadoOrden" AS ENUM ('resuelto', 'parcial', 'sin_solucion');

-- CreateTable
CREATE TABLE "sectores" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "sectores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "apellido" VARCHAR(80) NOT NULL,
    "correo" VARCHAR(120) NOT NULL,
    "telefono" VARCHAR(15),
    "contrasena_hash" VARCHAR(255) NOT NULL,
    "tipo_usuario" "TipoUsuario" NOT NULL DEFAULT 'ciudadano',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desagues" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "latitud" DECIMAL(10,7) NOT NULL,
    "longitud" DECIMAL(10,7) NOT NULL,
    "direccion" VARCHAR(200) NOT NULL,
    "tipo_desague" "TipoDesague" NOT NULL,
    "sector_id" INTEGER NOT NULL,

    CONSTRAINT "desagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "desague_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "latitud" DECIMAL(10,7) NOT NULL,
    "longitud" DECIMAL(10,7) NOT NULL,
    "prioridad" "Prioridad" NOT NULL DEFAULT 'media',
    "estado" "EstadoEvento" NOT NULL DEFAULT 'pendiente',
    "fecha_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_evidencia" (
    "id" SERIAL NOT NULL,
    "evento_id" INTEGER NOT NULL,
    "url_imagen" VARCHAR(255) NOT NULL,
    "fecha_captura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fotos_evidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "id" SERIAL NOT NULL,
    "evento_id" INTEGER NOT NULL,
    "tecnico_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_intervencion" TIMESTAMP(3),
    "observaciones" TEXT,
    "resultado" "ResultadoOrden",

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" SERIAL NOT NULL,
    "evento_id" INTEGER NOT NULL,
    "estado_anterior" VARCHAR(30) NOT NULL,
    "estado_nuevo" VARCHAR(30) NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_evento_id_key" ON "ordenes_trabajo"("evento_id");

-- AddForeignKey
ALTER TABLE "desagues" ADD CONSTRAINT "desagues_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_desague_id_fkey" FOREIGN KEY ("desague_id") REFERENCES "desagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_evidencia" ADD CONSTRAINT "fotos_evidencia_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
