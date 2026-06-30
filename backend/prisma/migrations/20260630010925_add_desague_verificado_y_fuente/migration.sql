-- DropForeignKey
ALTER TABLE "desagues" DROP CONSTRAINT "desagues_sector_id_fkey";

-- DropForeignKey
ALTER TABLE "desagues" DROP CONSTRAINT "desagues_tipo_desague_id_fkey";

-- AlterTable
ALTER TABLE "desagues" ADD COLUMN     "fuente_datos" VARCHAR(30),
ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "codigo" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "tipo_desague_id" DROP NOT NULL,
ALTER COLUMN "sector_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "desagues" ADD CONSTRAINT "desagues_tipo_desague_id_fkey" FOREIGN KEY ("tipo_desague_id") REFERENCES "tipos_desague"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desagues" ADD CONSTRAINT "desagues_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
