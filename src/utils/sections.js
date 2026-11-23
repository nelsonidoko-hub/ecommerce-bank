// The homepage as a list of sections (mirrors the server's utils/sections.js).
// This file describes each section type for the builder: its name, what it
// does, its starting content, and the form fields to edit it.

export const MAX_SECTIONS = 20

// field kinds: text, textarea, select, number, link, image, category, list
export const SECTION_TYPES = {
  hero: {
    label: 'Banner slideshow',
    description: 'The big pictures or videos at the top. Edit the slides under Hero Banner.',
    single: true,
    defaults: {},
    fields: [],
  },
  products: {
    label: 'Products',
    description: 'Newest products, best sellers or one category, as a grid or a sliding row.',
    defaults: { title: 'New arrivals', subtitle: '', source: 'newest', category: '', count: 8, layout: 'grid' },
    fields: [
      { name: 'title', label: 'Title', kind: 'text', max: 120 },
      { name: 'subtitle', label: 'Small text under the title', kind: 'text', max: 300 },
      { name: 'source', label: 'Which products', kind: 'select', options: [['newest', 'Newest first'], ['bestsellers', 'Best sellers'], ['category', 'One category']] },
      { name: 'category', label: 'Category', kind: 'category', showIf: (d) => d.source === 'category' },
      { name: 'count', label: 'How many', kind: 'number', min: 1, max: 24 },
      { name: 'layout', label: 'Show as', kind: 'select', options: [['grid', 'Grid'], ['carousel', 'Sliding row']] },
    ],
  },
  banner: {
    label: 'Promo banner',
    description: 'A wide picture with a heading and a button. Good for sales.',
    defaults: { image: '', heading: 'Big sale this weekend', text: 'Up to 30% off selected items', buttonLabel: 'Shop now', buttonLink: '/shop' },
    fields: [
      { name: 'image', label: 'Picture', kind: 'image' },
      { name: 'heading', label: 'Heading', kind: 'text', max: 120 },
      { name: 'text', label: 'Text', kind: 'text', max: 300 },
      { name: 'buttonLabel', label: 'Button text', kind: 'text', max: 40 },
      { name: 'buttonLink', label: 'Button link', kind: 'link' },
    ],
  },
  featured: {
    label: 'Featured collection',
    description: 'A large picture beside four products from a category.',
    defaults: { title: 'Featured collection', image: '', buttonLabel: 'View all', buttonLink: '/shop', category: '' },
    fields: [
      { name: 'title', label: 'Title', kind: 'text', max: 120 },
      { name: 'image', label: 'Picture', kind: 'image' },
      { name: 'category', label: 'Category (empty = newest)', kind: 'category' },
      { name: 'buttonLabel', label: 'Button text', kind: 'text', max: 40 },
      { name: 'buttonLink', label: 'Button link', kind: 'link' },
    ],
  },
  text: {
    label: 'Text',
    description: 'A heading and a paragraph: your story, a notice, delivery information.',
    defaults: { heading: 'About us', text: 'Tell customers who you are and what makes your shop special.', align: 'center' },
    fields: [
      { name: 'heading', label: 'Heading', kind: 'text', max: 120 },
      { name: 'text', label: 'Text', kind: 'textarea', max: 2000 },
      { name: 'align', label: 'Alignment', kind: 'select', options: [['center', 'Centred'], ['left', 'Left']] },
    ],
  },
  imageText: {
    label: 'Image with text',
    description: 'A picture on one side, words and a button on the other.',
    defaults: { image: '', heading: 'Made with care', text: 'Share what goes into your products.', buttonLabel: 'Learn more', buttonLink: '/about', imageSide: 'left' },
    fields: [
      { name: 'image', label: 'Picture', kind: 'image' },
      { name: 'heading', label: 'Heading', kind: 'text', max: 120 },
      { name: 'text', label: 'Text', kind: 'textarea', max: 1000 },
      { name: 'buttonLabel', label: 'Button text', kind: 'text', max: 40 },
      { name: 'buttonLink', label: 'Button link', kind: 'link' },
      { name: 'imageSide', label: 'Picture on the', kind: 'select', options: [['left', 'Left'], ['right', 'Right']] },
    ],
  },
  testimonials: {
    label: 'Testimonials',
    description: 'What happy customers say. Up to 6.',
    defaults: {
      title: 'What our customers say',
      items: [
        { quote: 'Fast delivery and exactly as pictured. I will order again!', name: 'Chioma, Lagos' },
        { quote: 'Great quality for the price. Highly recommend.', name: 'Musa, Abuja' },
      ],
    },
    fields: [
      { name: 'title', label: 'Title', kind: 'text', max: 120 },
      { name: 'items', label: 'Quotes', kind: 'list', max: 6, of: [{ name: 'quote', label: 'Quote', kind: 'textarea', max: 400 }, { name: 'name', label: 'Name', kind: 'text', max: 60 }] },
    ],
  },
  whatsapp: {
    label: 'WhatsApp chat',
    description: 'A button that opens a WhatsApp chat with you. Uses the number in Settings.',
    defaults: { heading: 'Questions? Chat with us', text: 'We usually reply within minutes.', buttonLabel: 'Chat on WhatsApp' },
    fields: [
      { name: 'heading', label: 'Heading', kind: 'text', max: 120 },
      { name: 'text', label: 'Text', kind: 'text', max: 300 },
      { name: 'buttonLabel', label: 'Button text', kind: 'text', max: 40 },
    ],
  },
}

export const ADDABLE_TYPES = Object.keys(SECTION_TYPES)

const randomId = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0')

export function newSection(type) {
  const def = SECTION_TYPES[type]
  return { id: randomId(), type, enabled: true, data: JSON.parse(JSON.stringify(def.defaults)) }
}

// A short name for the section list, e.g. "Products · Best sellers"
export function sectionTitle(section) {
  const def = SECTION_TYPES[section.type]
  const d = section.data || {}
  const detail = d.title || d.heading || ''
  return detail ? `${def?.label || section.type} · ${detail}` : def?.label || section.type
}

// Shops from before the builder (same as the server's version)
export function sectionsFromLegacy(s = {}) {
  const a = s.homeArrivals || {}
  const b = s.homeBestSellers || {}
  const banner = s.homeBanner || {}
  const row = s.homeCategoryRow || {}
  const f = s.homeFeatured || {}
  const on = (block) => block.enabled !== false
  return [
    { id: 'hero', type: 'hero', enabled: true, data: {} },
    { id: 'new-arrivals', type: 'products', enabled: on(a), data: { title: a.title ?? 'New Arrivals', subtitle: a.subtitle ?? '', source: 'newest', category: '', count: Number(a.count) || 8, layout: 'grid' } },
    { id: 'best-sellers', type: 'products', enabled: on(b), data: { title: b.title ?? 'Best Sellers', subtitle: b.label ?? '', source: 'bestsellers', category: '', count: 12, layout: 'carousel' } },
    { id: 'promo-banner', type: 'banner', enabled: on(banner), data: { image: banner.image || '', heading: banner.heading || '', text: banner.text || '', buttonLabel: banner.buttonLabel || '', buttonLink: banner.buttonLink || '' } },
    { id: 'category-row', type: 'products', enabled: on(row) && Boolean(row.category), data: { title: row.title || '', subtitle: '', source: 'category', category: row.category || '', count: 12, layout: 'carousel' } },
    { id: 'featured', type: 'featured', enabled: on(f), data: { title: f.title || '', image: f.image || '', buttonLabel: f.buttonLabel || '', buttonLink: f.buttonLink || '', category: f.category || '' } },
  ]
}

export function homeSectionsOf(settings) {
  const saved = settings?.homeSections
  return Array.isArray(saved) && saved.length ? saved : sectionsFromLegacy(settings)
}

// Is a link inside the shop ("/shop") or out to another site?
export const isExternal = (link) => /^https?:\/\//i.test(link || '')
