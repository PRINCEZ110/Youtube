export function formatViews(views: number): string {
  if (views < 1_000) return views.toString()
  if (views < 1_000_000) return `${(views / 1_000).toFixed(1)}K`
  if (views < 1_000_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  return `${(views / 1_000_000_000).toFixed(1)}B`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function timeAgo(date: string | Date): string {
  const parsed = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(parsed.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - parsed.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffWeek < 4) return `${diffWeek}w ago`
  if (diffMonth < 12) return `${diffMonth}mo ago`
  return `${diffYear}y ago`
}

export function formatCompactNumber(n: number): string {
  if (n < 1_000) return n.toString()
  if (n < 1_000_000) return `${(n / 1_000).toFixed(1)}K`
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  return `${(n / 1_000_000_000).toFixed(1)}B`
}

export interface HighlightPart {
  text: string
  highlight: boolean
}

export function highlightMatch(text: string, query: string): HighlightPart[] {
  const q = query.trim().toLowerCase()
  if (!q) return [{ text, highlight: false }]
  const parts: HighlightPart[] = []
  const lower = text.toLowerCase()
  let cursor = 0
  let index = lower.indexOf(q)
  while (index !== -1) {
    if (index > cursor) parts.push({ text: text.slice(cursor, index), highlight: false })
    parts.push({ text: text.slice(index, index + q.length), highlight: true })
    cursor = index + q.length
    index = lower.indexOf(q, cursor)
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), highlight: false })
  return parts
}
