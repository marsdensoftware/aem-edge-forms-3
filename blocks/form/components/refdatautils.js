/*eslint-disable*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Utilities for working with remote Reference Data suggestions used by form components
 * (e.g., search boxes and typeaheads).
 *
 * This module builds a same-origin URL from a form-provided base and fetches
 * suggestion data with query, category, and limit parameters.
 */
function resolveSameOriginUrl(basePath) {
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
export const SUGGESTION_LIMIT = 8;
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
 * @param filterMode Optional search filter mode. Defaults to splitwith which searches
 * the start of all strings in a candidate
 * @param element Optional DOM element inside a form; used to locate the form and its data attributes.
 * @returns A promise that resolves to an array of Suggestion items.
 * @throws Error if the HTTP response is not ok (non-2xx status).
 */
export function fetchRemoteSuggestions(category_1, query_1, limit_1, controller_1, element_1) {
    return __awaiter(this, arguments, void 0, function* (category, query, limit, controller, element, filterMode = 'splitwith') {
        var _a;
        // Determine the base URL from the nearest form element
        const form = element === null || element === void 0 ? void 0 : element.closest('form');
        const baseUrl = ((_a = form === null || form === void 0 ? void 0 : form.dataset) === null || _a === void 0 ? void 0 : _a.referenceDataUrl) || '';
        // Build a proper same-origin URL (unless already absolute)
        const url = resolveSameOriginUrl(baseUrl);
        // Append query parameters
        url.searchParams.set('category', category);
        url.searchParams.set('q', query);
        url.searchParams.set('mode', filterMode);
        url.searchParams.set('limit', String(limit));
        // Fire the request with CORS and credentials so server-side sessions/cookies apply
        const res = yield fetch(url.toString(), { signal: controller.signal, mode: 'cors', credentials: 'include' });
        if (!res.ok) {
            throw new Error(`Failed to fetch suggestions: ${res.status} ${res.statusText}`);
        }
        // Expected response shape from the service
        const data = yield res.json();
        // Normalize and return suggestions, dropping any entries without a description
        return (data.results || [])
            .filter((r) => r && r.description)
            .map((r) => ({ code: r.code, description: r.description, proficiencyCodes: r.proficiencyCodes }));
    });
}
