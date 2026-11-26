import { Navigate } from 'react-router-dom'
import { getAccount } from '../../../services/platformService'
import { TEMPLATES, CLASSIC_BRAND_DISPLAY } from '../../../utils/themes'
import { PARTS } from '../../../storefront/parts'

// The founder and team members marked as designers
export const canUseStudio = (account) => account?.role === 'superadmin' || account?.designer === true

export function StudioOnly({ children }) {
  const account = getAccount()
  if (!account) return <Navigate to="/login" replace />
  if (!canUseStudio(account)) return <Navigate to="/dashboard" replace />
  return children
}

export const STATUS = {
  draft: ['Draft', 'bg-slate-100 text-slate-700'],
  review: ['Waiting for review', 'bg-amber-100 text-amber-800'],
  published: ['In the gallery', 'bg-emerald-100 text-emerald-800'],
  hidden: ['Hidden', 'bg-red-100 text-red-700'],
}
export function StatusChip({ status }) {
  const [label, cls] = STATUS[status] || STATUS.draft
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
}

// Plain-language names for every part, so anyone on the team can use the Studio
export const PART_LABELS = {
  card: {
    standard: ['Standard', 'Picture, name, price and an Add button'],
    borderless: ['Clean', 'No borders, lots of space (fashion)'],
    bordered: ['Boxed', 'Thick black outline (streetwear)'],
    menu: ['Menu row', 'Small picture on the left, like a food menu (needs "List")'],
    compact: ['Compact', 'Small and dense, price first (big shops)'],
    centered: ['Centred', 'Soft, centred text, round button (beauty, jewellery)'],
    spec: ['Spec sheet', 'Product on white, full-width button (gadgets)'],
    tile: ['Tile', 'Chunky tinted tiles with a round + (kids, fun)'],
  },
  // Page structure: from the parts registry, so template packs' parts appear too
  hero: Object.fromEntries(Object.entries(PARTS.hero).map(([id, p]) => [id, [p.label, p.help]])),
  nav: Object.fromEntries(Object.entries(PARTS.nav).map(([id, p]) => [id, [p.label, p.help]])),
  home: Object.fromEntries(Object.entries(PARTS.home).map(([id, p]) => [id, [p.label, p.help]])),
  grid: { grid: ['Grid', 'Products side by side'], list: ['List', 'One product per row'] },
  // Round 2: the rest of the shop
  rows: {
    grid: ['Grid', 'Products side by side'],
    slider: ['Sliding row', 'Swipe sideways through the products'],
    spotlight: ['Spotlight', 'First product big, four small beside it (beauty, fashion)'],
    shelf: ['Shelf', 'Small photo beside name and price, many per screen (supermarkets)'],
  },
  categories: {
    none: ['None', 'No category strip'],
    tiles: ['Big photos', 'Large portrait photo per category (fashion)'],
    circles: ['Circles', 'Round photos you swipe through (big shops, kids)'],
    chips: ['Buttons', 'A row of small category buttons (food, simple shops)'],
    banners: ['Wide banners', 'Two wide pictures per row with "Shop now" (electronics)'],
  },
  quotes: {
    cards: ['Cards', 'Three reviews in white boxes'],
    single: ['One big quote', 'One review at a time, large, with dots'],
    plain: ['Magazine', 'Italic quotes with a thin line beside them'],
  },
  product: {
    classic: ['Classic', 'Photo left, details and buttons right'],
    wide: ['Wide photos', 'Photos across the top, details underneath (streetwear)'],
    sticky: ['Tall gallery', 'All photos large down the page, the buy box stays in view (fashion, beauty)'],
    simple: ['Simple', 'One column in the middle (food, small shops)'],
  },
  listing: {
    standard: ['Standard', 'Filters in a row above the products'],
    sidebar: ['Sidebar filters', 'Categories, prices and stock in a column on the left (big shops)'],
    chips: ['Filter buttons', 'Tap-to-filter buttons that swipe on phones (food, phones)'],
    large: ['Big photos', 'Two large products per row, quiet filters (fashion)'],
  },
  density: {
    compact: ['Compact', 'Sections close together, more on screen'],
    normal: ['Normal', 'Balanced'],
    airy: ['Airy', 'Lots of space, calm and premium'],
  },
  footer: { dark: ['Dark', 'Dark footer'], light: ['Light', 'Light footer'] },
  radius: { square: 'Square', soft: 'Slightly rounded', round: 'Very rounded' },
  headingFont: { poppins: 'Poppins (modern)', epilogue: 'Epilogue (clean)', anton: 'Anton (tall and bold)', playfair: 'Playfair (elegant serif)' },
  bodyFont: { epilogue: 'Epilogue', poppins: 'Poppins' },
  headingWeight: { 0: 'Template default', 400: 'Regular', 500: 'Medium', 600: 'Semi-bold', 700: 'Bold', 800: 'Extra bold' },
}

// A built-in template as a starting recipe
export function recipeFromBuiltIn(id) {
  const t = TEMPLATES[id] || TEMPLATES.classic
  return {
    brand: t.brand || CLASSIC_BRAND_DISPLAY,
    ink: t.ink,
    surface: t.surface,
    headingFont: t.headingFont,
    bodyFont: t.bodyFont,
    radius: t.radius,
    uppercase: t.uppercase,
    headingWeight: t.headingWeight,
    layout: { ...t.layout },
    words: { ...t.words },
  }
}
