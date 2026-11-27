// Adapted from "BloomShop", a free Next.js and Tailwind e-commerce template.
// Design and code © Bloomtpl (https://github.com/bloomtpl), MIT licence,
// distributed by ThemeWagon (https://themewagon.com). Rebuilt for ShopBuilder.

// The Bloom homepage: no banner, a big centred headline (the first text
// section), then a clean grid of products and the merchant's other sections.
// Props come from pages/Home.jsx.
function BloomHome({ settings, sections, renderSection }) {
  const list = sections.filter((s) => s.type !== 'hero')
  const intro = list.find((s) => s.type === 'text' && s.data?.heading)
  const rest = list.filter((s) => s !== intro)
  return (
    <div className="px-4 pt-24 sm:pt-32 lg:px-8">
      <header className="mx-auto mb-12 max-w-3xl space-y-3 text-center sm:mb-16">
        <h1 className="font-poppins text-4xl font-semibold tracking-tight text-blue-600 text-balance xl:text-5xl">{intro?.data?.heading || settings.storeName}</h1>
        {intro?.data?.text && <p className="text-base text-balance text-gray-700 sm:text-lg">{intro.data.text}</p>}
      </header>
      <div className="mx-auto max-w-7xl">{rest.map(renderSection)}</div>
    </div>
  )
}

export default BloomHome
