import { PACKS } from './packs'

// The storefront's structure parts: which menu, banner and homepage a template
// uses. The Template Studio offers everything listed here, so a part added by
// a template pack (storefront/packs) shows up there automatically.
//
//   nav:  the menu bar.  Built-in ones are styles of components/Navbar.jsx.
//   home: the homepage.  Built-in ones are layouts of pages/Home.jsx. A pack's
//         home gets { settings, sections, renderSection, products } and can draw
//         anything (see packs/spotlight).
//   hero: the banner.    Styles of components/Hero.jsx.

const BUILT_IN = {
  nav: {
    standard: { label: 'Standard', help: 'Categories left, logo in the middle, cart right' },
    centered: { label: 'Centred logo', help: 'Big logo in the middle, menu underneath (fashion)' },
    search: { label: 'Search bar', help: 'Logo, a wide search bar and cart; categories underneath (electronics, big shops)' },
  },
  hero: {
    full: { label: 'Full screen', help: 'A big picture that fills the screen' },
    compact: { label: 'Medium', help: 'A shorter banner' },
    slim: { label: 'Slim strip', help: 'Just a strip, so products show first' },
    split: { label: 'Split screen', help: 'Photo on one side, words on the other (fashion)' },
    none: { label: 'No banner', help: 'Products straight away (big catalogs)' },
  },
  home: {
    sections: { label: 'Standard', help: "The merchant's sections, one under the other" },
    lookbook: { label: 'Lookbook', help: 'Big "shop by category" photos, then the products (fashion)' },
    sidebar: { label: 'Sidebar catalog', help: 'Category sidebar beside the products (electronics, big shops)' },
  },
}

function build() {
  const parts = { nav: { ...BUILT_IN.nav }, hero: { ...BUILT_IN.hero }, home: { ...BUILT_IN.home } }
  for (const pack of PACKS) {
    for (const kind of ['nav', 'home']) {
      for (const [id, part] of Object.entries(pack.parts?.[kind] || {})) {
        if (parts[kind][id]) {
          console.warn(`Template pack "${pack.id}": ${kind} part "${id}" already exists, skipped`)
          continue
        }
        parts[kind][id] = { ...part, pack: pack.id }
      }
    }
  }
  return parts
}

export const PARTS = build()

// The custom component a pack gives for this part, if any
export const packComponent = (kind, id) => PARTS[kind]?.[id]?.Component || null
// A part id the storefront knows, or the standard one
export const knownPart = (kind, id, fallback) => (PARTS[kind]?.[id] ? id : fallback)
