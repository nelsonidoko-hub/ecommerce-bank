import { storeKey } from './storeContext'
// Store templates: the presets, and the code that turns a chosen template into
// the CSS variables the storefront reads.
//
// How it works: the storefront's existing classes (bg-blue-600, rounded-md,
// font-poppins ...) all read CSS variables. PublicLayout puts a wrapper around
// the store and sets those variables on it, so the whole storefront changes look
// without editing each component. The admin area is outside the wrapper, so it
// never changes.

// ---------- fonts and corners the owner can pick from ----------

export const FONT_STACKS = {
  poppins: '"Poppins", sans-serif',
  epilogue: '"Epilogue", sans-serif',
  anton: '"Anton", sans-serif',
  playfair: '"Playfair Display", serif',
}

export const FONT_LABELS = {
  poppins: 'Poppins (modern and rounded)',
  epilogue: 'Epilogue (clean)',
  anton: 'Anton (tall and bold)',
  playfair: 'Playfair Display (elegant serif)',
}

export const HEADING_FONTS = ['poppins', 'epilogue', 'anton', 'playfair']
export const BODY_FONTS = ['epilogue', 'poppins']

export const RADIUS_LABELS = { square: 'Square', soft: 'Soft', round: 'Rounded' }

// What the store looked like before templates existed. Anything equal to these
// needs no override, which is why Classic changes nothing at all.
const APP_DEFAULTS = { headingFont: 'poppins', bodyFont: 'epilogue', radius: 'soft' }

// ---------- the templates ----------
// brand   = buttons, links and highlights ('' keeps the store's original blue)
// ink     = the dark colour of buttons and strong text ('' keeps the original)
// surface = page background ('' keeps white)

export const TEMPLATES = {
  classic: {
    id: 'classic',
    label: 'Classic',
    bestFor: 'General shops',
    description: 'Clean and familiar. White with a blue accent.',
    brand: '',
    ink: '',
    surface: '',
    headingFont: 'poppins',
    bodyFont: 'epilogue',
    radius: 'soft',
    uppercase: false,
    headingWeight: 0,
    // How things are arranged, not just coloured:
    //   card:    standard | borderless | bordered | menu (a row with a photo on the left)
    //            | compact (dense, price first) | centered (soft, centred text)
    //            | spec (product on white, full-width button) | tile (tinted, chunky)
    //   grid:    grid | list (list shows products as menu rows)
    //   columns: products per row on desktop, in a grid (2-5)
    //   footer:  dark | light
    //   hero:    full (full screen) | compact | slim (a short strip, products first)
    //   search:  true shows a big search box above the products on shop and category pages
    layout: { card: 'standard', grid: 'grid', columns: 4, footer: 'dark', hero: 'full', search: false },
  },
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    bestFor: 'Fashion and boutiques',
    description: 'Calm and editorial. Warm cream, charcoal buttons, square corners and a serif headline.',
    brand: '#262626',
    ink: '#262626',
    surface: '#f6f3ec',
    headingFont: 'playfair',
    bodyFont: 'epilogue',
    radius: 'square',
    uppercase: false,
    headingWeight: 500,
    layout: { card: 'borderless', grid: 'grid', columns: 4, footer: 'light', hero: 'full', search: false },
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    bestFor: 'Streetwear and electronics',
    description: 'Loud and high contrast. Black and white, a hot red accent, sharp corners and big uppercase headings.',
    brand: '#e11d2e',
    ink: '#000000',
    surface: '',
    headingFont: 'anton',
    bodyFont: 'epilogue',
    radius: 'square',
    uppercase: true,
    headingWeight: 400,
    layout: { card: 'bordered', grid: 'grid', columns: 3, footer: 'dark', hero: 'full', search: false },
  },
  fresh: {
    id: 'fresh',
    label: 'Fresh',
    bestFor: 'Restaurants, bakeries and food vendors',
    description: 'Warm and friendly. A menu-style list with a photo, description and price on each row, round corners and a compact banner.',
    brand: '#c2410c',
    ink: '#3b2a1a',
    surface: '#fffaf2',
    headingFont: 'poppins',
    bodyFont: 'poppins',
    radius: 'round',
    uppercase: false,
    headingWeight: 0,
    layout: { card: 'menu', grid: 'list', columns: 4, footer: 'light', hero: 'compact', search: false },
  },
  catalog: {
    id: 'catalog',
    label: 'Catalog',
    bestFor: 'Shops with lots of products',
    description: 'Built for big ranges. A short banner, a big search box, five products per row and price-first cards so customers can scan fast.',
    brand: '#047857',
    ink: '#111827',
    surface: '',
    headingFont: 'epilogue',
    bodyFont: 'epilogue',
    radius: 'soft',
    uppercase: false,
    headingWeight: 0,
    layout: { card: 'compact', grid: 'grid', columns: 5, footer: 'dark', hero: 'slim', search: true },
  },
  glow: {
    id: 'glow',
    label: 'Glow',
    bestFor: 'Beauty, skincare, hair and perfume',
    description: 'Soft and polished. Blush pink, a rose accent, elegant serif headings and gently rounded cards with centred text.',
    brand: '#be185d',
    ink: '#4a1d2c',
    surface: '#fdf4f5',
    headingFont: 'playfair',
    bodyFont: 'poppins',
    radius: 'round',
    uppercase: false,
    headingWeight: 500,
    layout: { card: 'centered', grid: 'grid', columns: 4, footer: 'light', hero: 'full', search: false },
  },
  tech: {
    id: 'tech',
    label: 'Tech',
    bestFor: 'Phones, gadgets and electronics',
    description: 'Crisp and clear. Cool grey and teal, products shown whole on white like a spec sheet, a full-width Add to cart button and a big search box.',
    brand: '#0e7490',
    ink: '#0f172a',
    surface: '#f8fafc',
    headingFont: 'epilogue',
    bodyFont: 'epilogue',
    radius: 'soft',
    uppercase: false,
    headingWeight: 0,
    layout: { card: 'spec', grid: 'grid', columns: 4, footer: 'dark', hero: 'compact', search: true },
  },
  playful: {
    id: 'playful',
    label: 'Playful',
    bestFor: 'Kids, baby items and toys',
    description: 'Bright and cheerful. Warm cream, a purple accent, chunky tinted cards with extra-round corners and a round add button.',
    brand: '#7c3aed',
    ink: '#1e1b4b',
    surface: '#fffbeb',
    headingFont: 'poppins',
    bodyFont: 'poppins',
    radius: 'round',
    uppercase: false,
    headingWeight: 0,
    layout: { card: 'tile', grid: 'grid', columns: 4, footer: 'light', hero: 'compact', search: false },
  },
}

export const TEMPLATE_LIST = Object.values(TEMPLATES)

// Shown as the "current colour" for Classic, which uses Tailwind's own blue
export const CLASSIC_BRAND_DISPLAY = '#155dfc'

// ---------- colour maths ----------

export const isHex = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)))
const parseHex = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb) => `#${rgb.map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`

// amountOfA = 0.8 means 80% of colour a and 20% of colour b
export function mix(a, b, amountOfA) {
  const A = parseHex(a)
  const B = parseHex(b)
  return toHex(A.map((value, i) => value * amountOfA + B[i] * (1 - amountOfA)))
}

function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

// White text sits on the brand colour (buttons), so check it against white.
// 'poor' means the text would be hard to read, 'blocked' means we refuse it.
export function brandReadability(brand) {
  if (!isHex(brand)) return 'good'
  const ratio = contrastRatio(brand, '#ffffff')
  if (ratio < 2) return 'blocked'
  if (ratio < 3) return 'poor'
  if (ratio < 4.5) return 'ok'
  return 'good'
}

// ---------- turning saved settings into a finished theme ----------

// saved = the "theme" section of the store settings:
//   { template, brandColor, headingFont, bodyFont, radius }
// The template supplies every value; the owner's choices override some of them.
// Anything unknown or invalid is ignored, so bad data can never break the store.
export function resolveTheme(saved) {
  const s = saved && typeof saved === 'object' ? saved : {}
  const base = TEMPLATES[s.template] || TEMPLATES.classic

  return {
    template: base.id,
    brand: isHex(s.brandColor) ? s.brandColor.toLowerCase() : base.brand,
    ink: base.ink,
    surface: base.surface,
    headingFont: FONT_STACKS[s.headingFont] && HEADING_FONTS.includes(s.headingFont) ? s.headingFont : base.headingFont,
    bodyFont: FONT_STACKS[s.bodyFont] && BODY_FONTS.includes(s.bodyFont) ? s.bodyFont : base.bodyFont,
    radius: RADIUS_LABELS[s.radius] ? s.radius : base.radius,
    uppercase: base.uppercase,
    headingWeight: base.headingWeight,
    layout: base.layout,
  }
}

const RADIUS_VARS = {
  square: {
    '--radius-xs': '0px',
    '--radius-sm': '0px',
    '--radius-md': '0px',
    '--radius-lg': '0px',
    '--radius-xl': '0px',
    '--radius-2xl': '0px',
  },
  round: {
    '--radius-xs': '0.25rem',
    '--radius-sm': '0.5rem',
    '--radius-md': '0.75rem',
    '--radius-lg': '1rem',
    '--radius-xl': '1.5rem',
    '--radius-2xl': '2rem',
  },
  soft: {},
}

// The inline style for the wrapper. It only contains values that differ from the
// store's original look, so Classic produces an empty object.
export function themeStyle(theme) {
  const style = {}

  if (theme.brand) {
    // The store's accent classes are all "blue", so the brand colour takes their place
    style['--color-blue-50'] = mix(theme.brand, '#ffffff', 0.08)
    style['--color-blue-100'] = mix(theme.brand, '#ffffff', 0.16)
    style['--color-blue-500'] = theme.brand
    style['--color-blue-600'] = theme.brand
    style['--color-blue-700'] = mix(theme.brand, '#000000', 0.82)
    style['--color-blue-800'] = mix(theme.brand, '#000000', 0.65)
  }

  if (theme.ink) {
    style['--color-black'] = theme.ink
    style['--color-gray-900'] = theme.ink
    style['--color-gray-800'] = mix(theme.ink, '#ffffff', 0.85)
  }

  if (theme.surface) {
    style['--color-white'] = theme.surface
    style.backgroundColor = theme.surface
  }

  Object.assign(style, RADIUS_VARS[theme.radius] || {})

  if (theme.headingFont !== APP_DEFAULTS.headingFont) {
    style['--theme-font-heading'] = FONT_STACKS[theme.headingFont]
  }
  if (theme.bodyFont !== APP_DEFAULTS.bodyFont) {
    style['--theme-font-body'] = FONT_STACKS[theme.bodyFont]
  }
  // Templates other than Classic set one body font for all text
  if (theme.template !== 'classic' || theme.bodyFont !== APP_DEFAULTS.bodyFont) {
    style.fontFamily = FONT_STACKS[theme.bodyFont]
  }

  return style
}

// Classes for the wrapper. The matching rules live in index.css.
export function themeClasses(theme) {
  return [
    'store-theme',
    theme.uppercase && 'theme-upper',
    theme.headingWeight === 400 && 'theme-weight-400',
    theme.headingWeight === 500 && 'theme-weight-500',
  ]
    .filter(Boolean)
    .join(' ')
}

// ---------- remembering the theme between visits ----------
// Without this, a store using Minimal would flash the Classic look for a moment
// on every visit while the settings download.

const STORAGE_KEY = 'store_theme'

export function readStoredTheme() {
  try {
    const raw = localStorage.getItem(storeKey(STORAGE_KEY))
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function storeTheme(theme) {
  try {
    localStorage.setItem(storeKey(STORAGE_KEY), JSON.stringify(theme || {}))
  } catch {
    // storage unavailable: the theme still works, it just may flash once
  }
}