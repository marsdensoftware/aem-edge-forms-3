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
export const API_BASE = 'http://localhost:4502/bin/sep/refdata.json';
export const SUGGESTION_LIMIT = 8;
export function fetchRemoteSuggestions(category, query, limit, controller) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = new URL(API_BASE);
        url.searchParams.set('category', category);
        url.searchParams.set('q', query);
        url.searchParams.set('limit', String(limit));
        const res = yield fetch(url.toString(), { signal: controller.signal, mode: 'cors', credentials: 'include' });
        if (!res.ok) {
            throw new Error(`Failed to fetch suggestions: ${res.status} ${res.statusText}`);
        }
        const data = yield res.json();
        return (data.results || [])
            .filter((r) => r && r.description)
            .map((r) => ({ code: r.code, description: r.description }));
    });
}
