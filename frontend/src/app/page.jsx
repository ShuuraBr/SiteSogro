import { redirect } from 'next/navigation'

// O site institucional é servido como HTML estático em /public/index.html
// O Next.js serve arquivos de /public/ diretamente
export default function Home() {
  redirect('/index.html')
}
