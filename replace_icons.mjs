import fs from 'fs'
import path from 'path'

function walkDir(dir) {
  const files = []
  const list = fs.readdirSync(dir)
  for (const file of list) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      files.push(...walkDir(filePath))
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      files.push(filePath)
    }
  }
  return files
}

const dir = 'src/app/admin/dashboard'
const files = walkDir(dir)

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  if (content.includes("'lucide-react'") && !content.includes("'use client'") && !content.includes('"use client"')) {
    const newContent = content.replace(/'lucide-react'/g, "'@/components/Icons'")
    fs.writeFileSync(file, newContent, 'utf8')
    console.log(`Updated ${file}`)
  }
}
