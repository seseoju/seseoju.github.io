const fs = require("fs")
const path = require("path")

// 설정
const DRAFTS_DIR = "drafts"
const BLOG_DIR = "content/blog"

// 색상 출력을 위한 유틸리티
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
}

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logError(message) {
  log(`❌ ${message}`, "red")
}

function logSuccess(message) {
  log(`✅ ${message}`, "green")
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue")
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow")
}

// drafts 디렉토리 스캔
function scanDrafts() {
  const draftsPath = path.join(process.cwd(), DRAFTS_DIR)

  if (!fs.existsSync(draftsPath)) {
    logError(`Drafts directory not found: ${draftsPath}`)
    return []
  }

  const items = fs.readdirSync(draftsPath)
  const drafts = []

  for (const item of items) {
    const itemPath = path.join(draftsPath, item)
    const stats = fs.statSync(itemPath)

    if (stats.isDirectory()) {
      // 디렉토리인 경우
      const files = fs.readdirSync(itemPath)
      const hasMarkdown = files.some(file => file.endsWith(".md"))

      if (hasMarkdown) {
        drafts.push({
          name: item,
          path: itemPath,
          type: "directory",
          files: files,
        })
      }
    } else if (item.endsWith(".md")) {
      // 개별 마크다운 파일인 경우
      drafts.push({
        name: path.parse(item).name,
        path: itemPath,
        type: "file",
        files: [item],
      })
    }
  }

  return drafts
}

// frontmatter 변환
function convertFrontmatter(content, title) {
  const now = new Date().toISOString()

  // 기존 frontmatter가 있는지 확인
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)

  if (frontmatterMatch) {
    // 기존 frontmatter가 있으면 title만 업데이트
    const existingFrontmatter = frontmatterMatch[1]
    const updatedFrontmatter = existingFrontmatter.replace(
      /^title:\s*.*$/m,
      `title: "${title}"`
    )

    return content.replace(
      /^---\s*\n[\s\S]*?\n---\s*\n/,
      `---\n${updatedFrontmatter}\n---\n`
    )
  } else {
    // frontmatter가 없으면 새로 생성
    const newFrontmatter = `---
title: "${title}"
date: "${now}"
description: ""
---

`
    return newFrontmatter + content
  }
}

// 파일 복사
function copyFiles(sourcePath, targetPath, files) {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true })
  }

  for (const file of files) {
    const sourceFile = path.join(sourcePath, file)
    const targetFile = path.join(targetPath, file)

    try {
      if (fs.statSync(sourceFile).isFile()) {
        fs.copyFileSync(sourceFile, targetFile)
        logInfo(`  📄 Copied: ${file}`)
      }
    } catch (error) {
      logError(`  Failed to copy ${file}: ${error.message}`)
    }
  }
}

// 개별 draft 처리
function processDraft(draft, preview = false) {
  const { name, path: draftPath, type, files } = draft

  logInfo(`Processing: ${name} (${type})`)

  // 대상 경로 생성
  const targetDir = path.join(process.cwd(), BLOG_DIR, name)

  if (preview) {
    logInfo(`  Would create: ${targetDir}`)
    logInfo(`  Would copy files: ${files.join(", ")}`)
    return
  }

  // 마크다운 파일 찾기
  const markdownFile = files.find(file => file.endsWith(".md"))
  if (!markdownFile) {
    logWarning(`  No markdown file found in ${name}`)
    return
  }

  try {
    // 마크다운 파일 읽기
    const markdownPath = path.join(draftPath, markdownFile)
    let content = fs.readFileSync(markdownPath, "utf8")

    // frontmatter 변환
    content = convertFrontmatter(content, name)

    // 대상 디렉토리 생성
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // 마크다운 파일을 index.md로 복사
    const targetMarkdownPath = path.join(targetDir, "index.md")
    fs.writeFileSync(targetMarkdownPath, content)
    logSuccess(`  📝 Created: index.md`)

    // 다른 파일들 복사 (이미지 등)
    const otherFiles = files.filter(file => file !== markdownFile)
    if (otherFiles.length > 0) {
      copyFiles(draftPath, targetDir, otherFiles)
    }

    logSuccess(`  📁 Moved to: ${targetDir}`)

    if (fs.existsSync(draftPath)) {
      if (type === "directory") {
        // 디렉토리인 경우 재귀적으로 삭제
        fs.rmSync(draftPath, { recursive: true, force: true })
      } else {
        // 파일인 경우 단순 삭제
        fs.unlinkSync(draftPath)
      }
      logSuccess(` 📁 Deleted: ${draftPath}`)
    }
  } catch (error) {
    logError(`  Failed to process ${name}: ${error.message}`)
  }
}

// 메인 실행 함수
function main() {
  const args = process.argv.slice(2)
  const preview = args.includes("--preview")
  const specificDraft = args.find(arg => !arg.startsWith("--"))

  log(`🚀 Drafts to Blog Mover${preview ? " (Preview Mode)" : ""}`, "bright")
  log(`📁 Source: ${DRAFTS_DIR}`, "cyan")
  log(`📁 Target: ${BLOG_DIR}`, "cyan")
  console.log()

  // drafts 스캔
  const drafts = scanDrafts()

  if (drafts.length === 0) {
    logWarning("No drafts found to move")
    return
  }

  log(`Found ${drafts.length} draft(s):`, "bright")
  drafts.forEach(draft => {
    log(`  • ${draft.name} (${draft.type})`)
  })
  console.log()

  // 특정 draft만 처리
  if (specificDraft) {
    const targetDraft = drafts.find(d => d.name === specificDraft)
    if (targetDraft) {
      log(`🎯 Processing specific draft: ${specificDraft}`, "magenta")
      processDraft(targetDraft, preview)
    } else {
      logError(`Draft not found: ${specificDraft}`)
      log(`Available drafts: ${drafts.map(d => d.name).join(", ")}`)
    }
    return
  }

  // 모든 draft 처리
  if (preview) {
    log(`👀 Preview mode - no files will be moved`, "yellow")
  } else {
    const response = require("readline-sync").question(
      `Do you want to move all ${drafts.length} drafts? (y/N): `
    )

    if (response.toLowerCase() !== "y") {
      log("Operation cancelled", "yellow")
      return
    }
  }

  console.log()
  drafts.forEach(draft => {
    processDraft(draft, preview)
    console.log()
  })

  if (!preview) {
    logSuccess(`🎉 All drafts processed successfully!`)
    logInfo(`Check ${BLOG_DIR} directory for the moved content.`)
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

module.exports = {
  scanDrafts,
  processDraft,
  convertFrontmatter,
}
