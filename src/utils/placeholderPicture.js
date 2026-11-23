// A soft gradient picture with a word or two on it, made in the browser.
// Used where a shop hasn't uploaded its own picture yet, so nobody ever sees
// another business's photos.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export function placeholderPicture(label = '', { from = '#475569', to = '#0f172a', width = 1600, height = 900 } = {}) {
  const size = Math.round(width / 14)
  const text = label
    ? `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${size}" font-weight="700" fill="#ffffff" fill-opacity="0.18">${esc(String(label).slice(0, 24))}</text>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${text}</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
