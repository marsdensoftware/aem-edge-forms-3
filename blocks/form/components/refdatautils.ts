/**
 * Utilities for working with remote Reference Data suggestions used by form components
 * (e.g., search boxes and typeaheads).
 *
 * This module builds a same-origin URL from a form-provided base and fetches
 * suggestion data with query, category, and limit parameters.
 */
function resolveSameOriginUrl(basePath: string): URL {
  // If explicitly absolute (http/https), use as-is
  if (basePath.startsWith('http:') || basePath.startsWith('https:')) {
    return new URL(basePath);
  }

  // Ensure leading slash for relative paths and resolve against current origin
  const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return new URL(normalizedPath, window.location.origin);
}

/**
 * Maximum number of suggestions typically requested from the backend.
 * Consumers can override with a custom limit when calling fetchRemoteSuggestions.
 */
export const SUGGESTION_LIMIT = 8

/**
 * A single suggestion item returned by the Reference Data service.
 */
export type Suggestion = {
  /** A machine-readable code identifying the suggestion. */
  code: string;
  /** A human-friendly description of the suggestion. */
  description: string;
  /** Optional array of related proficiency codes (if applicable). */
  proficiencyCodes?: string[];
}

/**
 * Fetch suggestions from a remote Reference Data endpoint.
 *
 * The base URL is taken from the closest enclosing <form> element's
 * data-reference-data-url attribute (dataset.referenceDataUrl). This value can
 * be absolute (http/https) or a relative path which will be resolved against
 * the current origin.
 *
 * Network requests are cancellable via the provided AbortController.
 *
 * @param category The category or dataset to search within (e.g., "languages").
 * @param query The user-entered query string to match suggestions against.
 * @param limit Maximum number of results to request from the service.
 * @param controller AbortController used to cancel the in-flight request if needed.
 * @param element Optional DOM element inside a form; used to locate the form and its data attributes.
 * @returns A promise that resolves to an array of Suggestion items.
 * @throws Error if the HTTP response is not ok (non-2xx status).
 */
export async function fetchRemoteSuggestions(
  category: string,
  query: string,
  limit: number,
  controller: AbortController,
  element?: Element,
): Promise<Suggestion[]> {
  // Determine the base URL from the nearest form element
  const form = element?.closest('form')
  const baseUrl = form?.dataset?.referenceDataUrl || ''

  // Build a proper same-origin URL (unless already absolute)
  const url = resolveSameOriginUrl(baseUrl)

  // Append query parameters
  url.searchParams.set('category', category)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(limit))

  // Fire the request with CORS and credentials so server-side sessions/cookies apply
  const res = await fetch(url.toString(), { signal: controller.signal, mode: 'cors', credentials: 'include' })
  if (!res.ok) {
    throw new Error(`Failed to fetch suggestions: ${res.status} ${res.statusText}`)
  }

  // Expected response shape from the service
  const data = await res.json() as {
    category: string
    query: string
    limit: number
    total: number
    results: Array<{
      code: string;
      description: string;
      category: string;
      proficiencyCodes?: string[]
    }>
  }

  // Helpful during development; consider removing or gating behind a debug flag in production
  console.log(data)

  // Normalize and return suggestions, dropping any entries without a description
  return (data.results || [])
    .filter((r) => r && r.description)
    .map((r) => ({ code: r.code, description: r.description, proficiencyCodes: r.proficiencyCodes }))
}
