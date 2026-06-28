import { marked } from 'marked'

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderer = new marked.Renderer()

renderer.html = ({ text }) => escapeHtml(text)

renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
  return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

marked.use({ renderer })

export const renderNotebookMarkdown = (source: string): string => {
  const trimmed = source.trim()
  if (!trimmed) return ''

  return marked.parse(trimmed, { async: false }) as string
}
