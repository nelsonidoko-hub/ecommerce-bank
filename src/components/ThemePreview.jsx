import { useMemo } from 'react'
import { resolveTheme, themeStyle, themeClasses } from '../utils/themes'

// A small mock of the storefront (menu, banner, products, footer). It uses the
// same classes and the same kind of wrapper as the real store, so the colours,
// fonts, corners and layout here are what customers will see.
//   theme   - the saved-theme shape: { template, brandColor, headingFont, bodyFont, radius }
//   compact - smaller text, for the template thumbnails
function ThemePreview({ theme, compact = false }) {
  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const style = useMemo(() => themeStyle(resolved), [resolved])
  const { layout } = resolved

  const text = compact ? 'text-[8px]' : 'text-xs'
  const headline = compact ? 'text-[11px]' : 'text-xl'
  const pad = compact ? 'px-2 py-1.5' : 'px-4 py-3'

  const bannerPad =
    layout.hero === 'compact'
      ? compact
        ? 'px-3 py-2'
        : 'px-6 py-6'
      : compact
        ? 'px-3 py-4'
        : 'px-6 py-10'

  const products = [
    { name: 'Linen Shirt', price: '₦12,000', note: 'Soft and light' },
    { name: 'Canvas Tote', price: '₦8,500', note: 'Fits everything' },
    { name: 'Leather Belt', price: '₦6,000', note: 'Made to last' },
  ]

  const cardClass = {
    standard: compact ? 'p-0.5' : 'p-1',
    borderless: '',
    bordered: `border-2 border-gray-900 ${compact ? 'p-0.5' : 'p-1'}`,
  }[layout.card]

  const footerClass =
    layout.footer === 'light'
      ? 'border-t border-gray-200 bg-white text-gray-500'
      : 'bg-[#1f1f1f] text-gray-300'

  return (
    <div
      className={`${themeClasses(resolved)} ${text} pointer-events-none select-none overflow-hidden border border-gray-200 bg-white text-gray-900`}
      style={style}
      aria-hidden="true"
    >
      {/* Menu bar */}
      <div className={`flex items-center justify-between border-b border-gray-200 ${pad}`}>
        <div className="font-poppins flex gap-2 text-gray-600">
          <span>Women</span>
          <span>Shoes</span>
        </div>
        <span className="font-poppins font-bold tracking-wide">YOUR STORE</span>
        <span className="font-poppins text-gray-600">Cart (0)</span>
      </div>

      {/* Banner */}
      <div className={`bg-gray-700 text-center text-white ${bannerPad}`}>
        <h2 className={`font-poppins font-bold ${headline}`}>New Season</h2>
        <p className="mt-1 opacity-80">Shop the new collection</p>
        <span
          className={`mt-2 inline-block rounded-md bg-blue-600 text-white ${
            compact ? 'px-2 py-1' : 'px-4 py-2'
          }`}
        >
          Shop Now
        </span>
      </div>

      {/* Products: menu rows or a grid of cards */}
      {layout.grid === 'list' ? (
        <div className={compact ? 'px-2 py-1' : 'px-4 py-2'}>
          {products.map((product) => (
            <div
              key={product.name}
              className={`flex items-center gap-2 border-b border-gray-200 ${
                compact ? 'py-1' : 'py-2'
              }`}
            >
              <div
                className={`shrink-0 rounded-md bg-gray-200 ${compact ? 'h-5 w-5' : 'h-10 w-10'}`}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-epilogue truncate font-semibold">{product.name}</h3>
                <p className="truncate text-gray-500">{product.note}</p>
              </div>
              <span className="font-semibold">{product.price}</span>
              <span
                className={`rounded-md bg-blue-600 text-white ${
                  compact ? 'px-1.5 py-0.5' : 'px-3 py-1'
                }`}
              >
                Add
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-3 gap-2 ${compact ? 'p-2' : 'p-4'}`}>
          {products.map((product) => (
            <div key={product.name} className={cardClass}>
              <div className="aspect-[3/4] rounded-md bg-gray-200" />
              <h3 className="font-epilogue mt-1 font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.price}</p>
              <span
                className={`mt-1 inline-block rounded-md bg-gray-900 text-white ${
                  compact ? 'px-1.5 py-0.5' : 'px-3 py-1'
                }`}
              >
                Add
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className={`flex justify-center gap-3 ${footerClass} ${compact ? 'py-1' : 'py-3'}`}>
        <span>FAQ</span>
        <span>Shipping</span>
        <span>Contact</span>
      </div>
    </div>
  )
}

export default ThemePreview