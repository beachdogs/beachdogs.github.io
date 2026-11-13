import fs from 'node:fs'
import path from 'node:path'

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  summary: string
  author: string
  authorRole?: string
  tags: string[]
  coverImage?: string
  readTime: string
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog')

/**
 * Parses simple YAML frontmatter without external dependencies.
 */
function parseFrontmatter(fileContent: string): { data: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
  const match = frontmatterRegex.exec(fileContent)

  if (!match) {
    return { data: {}, content: fileContent }
  }

  const rawYaml = match[1]
  const content = match[2]
  const data: Record<string, any> = {}

  for (const line of rawYaml.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const key = trimmed.slice(0, colonIndex).trim()
    let value: any = trimmed.slice(colonIndex + 1).trim()

    // Handle string quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    } else if (value.startsWith('[') && value.endsWith(']')) {
      // Inline array: [a, b, c]
      value = value
        .slice(1, -1)
        .split(',')
        .map((item: string) => item.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else if (value === 'true') {
      value = true
    } else if (value === 'false') {
      value = false
    }

    data[key] = value
  }

  return { data, content }
}

/**
 * Calculates estimated reading time.
 */
function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200
  const wordCount = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  return `${minutes} min read`
}

/**
 * Sluggifies a heading text for anchor links.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

/**
 * Escapes HTML characters for security.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Converts inline markdown tokens to HTML.
 */
function parseInline(text: string): string {
  let result = text
  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, (_match, code) => {
    return `<code class="rounded bg-[#102832]/8 px-1.5 py-0.5 font-mono text-sm font-semibold text-[#102832] dark:bg-white/10 dark:text-white">${escapeHtml(code)}</code>`
  })

  // Images: ![alt](url)
  result = result.replace(/!\[(.*?)\]\((.*?)\)/g, (_match, alt, url) => {
    return `<figure class="my-8 overflow-hidden rounded-2xl border border-[#102832]/10 bg-white shadow-sm">
      <img src="${url}" alt="${escapeHtml(alt)}" class="w-full object-cover" loading="lazy" />
      ${alt ? `<figcaption class="py-2 text-center text-xs text-[#102832]/60">${escapeHtml(alt)}</figcaption>` : ''}
    </figure>`
  })

  // Links: [text](url)
  result = result.replace(/\[(.*?)\]\((.*?)\)/g, (_match, label, url) => {
    const isExternal = url.startsWith('http://') || url.startsWith('https://')
    const externalAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${url}" class="font-semibold text-[#f76f5f] underline decoration-[#f76f5f]/40 underline-offset-4 transition-colors hover:text-[#e95d4d] hover:decoration-[#f76f5f]"${externalAttrs}>${label}</a>`
  })

  // Bold & Italic: ***text***
  result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')

  // Bold: **text**
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#102832] dark:text-white">$1</strong>')

  // Italic: *text* or _text_
  result = result.replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em class="font-serif italic text-[#f76f5f]">$2</em>$3')
  result = result.replace(/(^|[^_])_([^_]+)_([^_]|$)/g, '$1<em>$2</em>$3')

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.*?)~~/g, '<del class="line-through text-[#102832]/50">$1</del>')

  return result
}

/**
 * Converts full markdown content to semantic, well-styled HTML.
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/)
  const htmlParts: string[] = []

  let inCodeBlock = false
  let codeBlockLang = ''
  let codeBlockLines: string[] = []

  let inList: 'ul' | 'ol' | null = null
  let listItems: string[] = []

  let inBlockquote = false
  let blockquoteLines: string[] = []

  function flushList() {
    if (!inList) return
    const tag = inList
    const content = listItems
      .map(
        (li) =>
          `<li class="relative pl-6 leading-relaxed before:absolute before:left-1 before:top-2.5 before:h-2 before:w-2 before:rounded-full before:bg-[#f76f5f]">${parseInline(li)}</li>`,
      )
      .join('\n')
    htmlParts.push(`<${tag} class="my-5 space-y-2 text-base text-[#102832]/85">${content}</${tag}>`)
    inList = null
    listItems = []
  }

  function flushBlockquote() {
    if (!inBlockquote) return
    const quoteText = blockquoteLines.join(' ')
    htmlParts.push(
      `<blockquote class="my-7 rounded-2xl border-l-4 border-[#f76f5f] bg-[#f76f5f]/8 p-5 pl-6 italic text-[#102832]">${parseInline(quoteText)}</blockquote>`,
    )
    inBlockquote = false
    blockquoteLines = []
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // 1. Fenced Code Block
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const code = escapeHtml(codeBlockLines.join('\n'))
        htmlParts.push(
          `<div class="my-6 overflow-hidden rounded-2xl border border-white/10 bg-[#173842] text-white shadow-lg">
            ${codeBlockLang ? `<div class="border-b border-white/10 bg-[#102832] px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-[#76e1d3]">${codeBlockLang}</div>` : ''}
            <pre class="overflow-x-auto p-4 font-mono text-sm leading-relaxed"><code>${code}</code></pre>
          </div>`,
        )
        inCodeBlock = false
        codeBlockLines = []
        codeBlockLang = ''
      } else {
        // Flush any active lists/quotes
        flushList()
        flushBlockquote()
        inCodeBlock = true
        codeBlockLang = trimmed.slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine)
      continue
    }

    // 2. Empty line resets paragraphs/lists/quotes
    if (!trimmed) {
      flushList()
      flushBlockquote()
      continue
    }

    // 3. Blockquotes
    if (trimmed.startsWith('>')) {
      flushList()
      inBlockquote = true
      blockquoteLines.push(trimmed.replace(/^>\s?/, ''))
      continue
    } else if (inBlockquote) {
      flushBlockquote()
    }

    // 4. Horizontal Rule
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      flushList()
      htmlParts.push('<hr class="my-10 border-t border-[#102832]/10" />')
      continue
    }

    // 4b. Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const nextLine = lines[i + 1]?.trim()
      if (nextLine && nextLine.startsWith('|') && /^[|\s-:]+$/.test(nextLine)) {
        flushList()
        flushBlockquote()

        const headerCells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())

        i += 1 // Skip separator line

        const bodyRows: string[][] = []
        while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|') && lines[i + 1].trim().endsWith('|')) {
          i++
          const rowCells = lines[i]
            .trim()
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim())
          bodyRows.push(rowCells)
        }

        const thead = `<thead><tr class="bg-[#173842] text-white">${headerCells
          .map((h) => `<th class="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[#76e1d3]">${parseInline(h)}</th>`)
          .join('')}</tr></thead>`

        const tbody = `<tbody class="divide-y divide-[#102832]/8 text-[#102832]/85">${bodyRows
          .map(
            (row) =>
              `<tr class="transition-colors hover:bg-[#f76f5f]/5">${row
                .map((cell) => `<td class="px-5 py-3.5">${parseInline(cell)}</td>`)
                .join('')}</tr>`,
          )
          .join('')}</tbody>`

        htmlParts.push(
          `<div class="my-8 overflow-x-auto rounded-2xl border border-[#102832]/10 bg-white shadow-sm"><table class="w-full text-left text-sm">${thead}${tbody}</table></div>`,
        )
        continue
      }
    }

    // 5. Headings
    if (trimmed.startsWith('#### ')) {
      flushList()
      const title = trimmed.slice(5)
      const id = slugify(title)
      htmlParts.push(
        `<h4 id="${id}" class="mt-8 mb-3 font-display text-lg font-bold tracking-tight text-[#102832]">${parseInline(title)}</h4>`,
      )
      continue
    }
    if (trimmed.startsWith('### ')) {
      flushList()
      const title = trimmed.slice(4)
      const id = slugify(title)
      htmlParts.push(
        `<h3 id="${id}" class="mt-10 mb-4 font-display text-2xl font-bold tracking-tight text-[#102832] sm:text-3xl">${parseInline(title)}</h3>`,
      )
      continue
    }
    if (trimmed.startsWith('## ')) {
      flushList()
      const title = trimmed.slice(3)
      const id = slugify(title)
      htmlParts.push(
        `<h2 id="${id}" class="mt-12 mb-5 font-display text-3xl font-bold tracking-tight text-[#102832] sm:text-4xl">${parseInline(title)}</h2>`,
      )
      continue
    }
    if (trimmed.startsWith('# ')) {
      flushList()
      const title = trimmed.slice(2)
      const id = slugify(title)
      htmlParts.push(
        `<h1 id="${id}" class="mt-14 mb-6 font-display text-4xl font-bold tracking-tight text-[#102832] sm:text-5xl">${parseInline(title)}</h1>`,
      )
      continue
    }

    // 6. Lists
    if (/^[-*]\s+/.test(trimmed)) {
      if (inList !== 'ul') {
        flushList()
        inList = 'ul'
      }
      listItems.push(trimmed.replace(/^[-*]\s+/, ''))
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (inList !== 'ol') {
        flushList()
        inList = 'ol'
      }
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''))
      continue
    }

    flushList()

    // 7. Regular Paragraph
    htmlParts.push(
      `<p class="my-4 text-base leading-relaxed text-[#102832]/85 sm:text-lg sm:leading-8">${parseInline(trimmed)}</p>`,
    )
  }

  flushList()
  flushBlockquote()

  return htmlParts.join('\n')
}

/**
 * Returns all published blog posts sorted by date descending.
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return []
  }

  const fileNames = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'))

  const posts: BlogPostMeta[] = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(POSTS_DIR, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = parseFrontmatter(fileContents)

    return {
      slug,
      title: data.title || slug.replace(/-/g, ' '),
      date: data.date ? String(data.date) : new Date().toISOString().split('T')[0],
      summary: data.summary || '',
      author: data.author || 'Beach Dog Team',
      authorRole: data.authorRole || 'Viral Growth & Playables',
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : ['Playables'],
      coverImage: data.coverImage || undefined,
      readTime: data.readTime || calculateReadingTime(content),
    }
  })

  // Sort newest first
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Returns a single post with converted HTML by its slug.
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const cleanSlug = path.basename(decodeURIComponent(slug))
  const fullPath = path.join(POSTS_DIR, `${cleanSlug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = parseFrontmatter(fileContents)
  const contentHtml = markdownToHtml(content)

  return {
    slug,
    title: data.title || slug.replace(/-/g, ' '),
    date: data.date ? String(data.date) : new Date().toISOString().split('T')[0],
    summary: data.summary || '',
    author: data.author || 'Beach Dog Team',
    authorRole: data.authorRole || 'Viral Growth & Playables',
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : ['Playables'],
    coverImage: data.coverImage || undefined,
    readTime: data.readTime || calculateReadingTime(content),
    contentHtml,
  }
}

/**
 * Returns all unique tags across all posts with count.
 */
export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts()
  const counts: Record<string, number> = {}

  for (const post of posts) {
    for (const tag of post.tags) {
      counts[tag] = (counts[tag] || 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}
