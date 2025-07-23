export function toInt(o) {
  if (o === null || typeof o === 'undefined') {
    return null;
  }
  const n = Number(o);
  return Number.isSafeInteger(n) ? n : null;
};

export function parseFlag(qs, name) {
  if (!qs.has(name)) {
    return null; // distinguish between set to false and missing
  }
  const value = qs.get(name);
  if (value === null || typeof value === 'undefined' || value === '') { // a flag with no value is true
    return true;
  }
  if (['true', '1', 'on', 'yes'].includes(value.toLowerCase())) {
    return true;
  }
  if (['false', '0', 'off', 'no'].includes(value.toLowerCase())) {
    return false;
  }
  return null;
};

export function validUrl(s) {
  try {
    const url = new URL(s);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
  }
  return false;
};
