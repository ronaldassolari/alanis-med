import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const videoLinks: { titulo: string; videoUrl: string }[] = [
  { titulo: 'Hipertensão Arterial Sistêmica',       videoUrl: 'https://www.youtube.com/watch?v=R2BSesLwX60' },
  { titulo: 'Síndrome Coronariana Aguda',            videoUrl: 'https://www.youtube.com/watch?v=PjdlvlFw3Fk' },
  { titulo: 'Pneumonia Adquirida na Comunidade',     videoUrl: 'https://www.youtube.com/watch?v=GDGFU1tEAeI' },
  { titulo: 'Acidente Vascular Cerebral',            videoUrl: 'https://www.youtube.com/watch?v=rOUXCl4GD-g' },
  { titulo: 'Abdome Agudo: Diagnóstico e Conduta',   videoUrl: 'https://www.youtube.com/watch?v=kKccQSE2o_o' },
  { titulo: 'Hérnias Abdominais',                    videoUrl: 'https://www.youtube.com/watch?v=yY_xDzcLCZ4' },
  { titulo: 'Queimaduras',                           videoUrl: 'https://www.youtube.com/watch?v=TWHKZl3tz2k' },
  { titulo: 'Crescimento e Desenvolvimento Normal',  videoUrl: 'https://www.youtube.com/watch?v=q8TlKg81dWI' },
  { titulo: 'Neonatologia: RN de Risco',             videoUrl: 'https://www.youtube.com/watch?v=SX31JuWihV0' },
  { titulo: 'Desnutrição e Distúrbios Nutricionais', videoUrl: 'https://www.youtube.com/watch?v=Opd0mpbhxkE' },
  { titulo: 'Pré-Natal de Baixo Risco',              videoUrl: 'https://www.youtube.com/watch?v=9hYWziBGDgA' },
  { titulo: 'Trabalho de Parto e Parto Normal',      videoUrl: 'https://www.youtube.com/watch?v=4ncME9RKObc' },
  { titulo: 'Contracepção e Planejamento Familiar',  videoUrl: 'https://www.youtube.com/watch?v=t3M35E94Cbo' },
  { titulo: 'Epidemiologia: Indicadores de Saúde',   videoUrl: 'https://www.youtube.com/watch?v=QTjmKQr4zy4' },
  { titulo: 'Saúde da Família e ESF',                videoUrl: 'https://www.youtube.com/watch?v=fCjXRi2Tp3A' },
]

async function main() {
  for (const { titulo, videoUrl } of videoLinks) {
    const result = await prisma.aula.updateMany({
      where: { titulo },
      data: { videoUrl },
    })
    console.log(`✅ ${titulo}: ${result.count} updated`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
