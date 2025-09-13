export const API_BASE = 'http://localhost:4502/bin/sep/refdata.json'
export const SUGGESTION_LIMIT = 8

export type Suggestion = { code: string; description: string }

export async function fetchRemoteSuggestions(
  category: string,
  query: string,
  limit: number,
  controller: AbortController,
): Promise<Suggestion[]> {
  const url = new URL(API_BASE)
  url.searchParams.set('category', category)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(limit))

  const res = await fetch(url.toString(), { signal: controller.signal, mode: 'cors', credentials: 'include' })
  if (!res.ok) {
    throw new Error(`Failed to fetch suggestions: ${res.status} ${res.statusText}`)
  }
  const data = await res.json() as {
    category: string
    query: string
    limit: number
    total: number
    results: Array<{ code: string; description: string; category: string }>
  }
  return (data.results || [])
    .filter((r) => r && r.description)
    .map((r) => ({ code: r.code, description: r.description }))
}
