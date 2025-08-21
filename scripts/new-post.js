const fs = require("fs")
const path = require("path")

const [, , rawTitle] = process.argv
if (!rawTitle) {
  console.error('Usage: node scripts/new-post.mjs "Post Title"')
  process.exit(1)
}

const slug = rawTitle
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-")

const now = new Date().toISOString()
const postDir = path.join(process.cwd(), "drafts", slug)
const mdPath = path.join(postDir, "index.md")

if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true })

const frontmatter = `---
title: "${rawTitle}"
date: "${now}"
description: ""
---
`

fs.writeFileSync(mdPath, frontmatter, { flag: "wx" })
console.log(`Created: ${mdPath}`)
