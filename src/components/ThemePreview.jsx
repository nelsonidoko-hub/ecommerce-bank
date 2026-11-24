import { useMemo } from 'react'
import { resolveTheme, themeStyle, themeClasses, TEMPLATES } from '../utils/themes'
import { pictureIcon, previewSet } from '../utils/pictureIcons'

// A small mock of the storefront (menu, banner, products, footer). It uses the
// same classes and the same kind of wrapper as the real store, so the colours,
// fonts, corners and layout here are what customers will see.
//   theme   - the saved-theme shape: { template, brandColor, headingFont, bodyFont, radius }
//             plus, for Template Studio templates, { recipe, sampleSet }
//   compact - smaller text, for the template thumbnails
function ThemePreview({ theme, compact = false }) {
  const resolved = useMemo(() => resolveTheme(theme), [theme])
  const style = useMemo(() => themeStyle(resolved), [resolved])
  const { layout } = resolved

  const text = compact ? 'text-[8px]' : 'text-xs'
  const headline = compact ? 'text-[11px]' : 'text-xl'
  const pad = compact ? 'px-2 py-1.5' : 'px-4 py-3'

  const bannerPad = {
    compact: compact ? 'px-3 py-2' : 'px-6 py-6',
    slim: compact ? 'px-3 py-1.5' : 'px-6 py-4',
  }[layout.hero] || (compact ? 'px-3 py-4' : 'px-6 py-10')

  // Dummy products with pictures that show what they are, matched to the
  // kind of shop, so anyone can tell at a glance what the template is for
  const set = previewSet(theme?.sampleSet || (TEMPLATES[theme?.template] ? theme.template : 'classic'))
  // Real photos from the Template Studio, where the template has them
  const photos = theme?.pictures && typeof theme.pictures === 'object' ? theme.pictures : {}
  const products = set.products.map(([name, price, note]) => ({ name, price, note, icon: pictureIcon(name), photo: photos.products?.[name] || '' }))
  const tint = resolved.brand || '#155dfc'
  const pictureStyle = { background: `linear-gradient(135deg, ${tint}22, ${tint}55)` }
  const photoStyle = (url) => ({ backgroundImage: `url("${url}")`, backgroundSize: 'cover', backgroundPosition: 'center' })
  const iconSize = compact ? 'text-[14px]' : 'text-3xl'
  // Dense templates show four across in the preview, the rest three
  const shown = layout.columns >= 5 ? products : products.slice(0, 3)
  const gridCols = layout.columns >= 5 ? 'grid-cols-4' : 'grid-cols-3'
  const btn = compact ? 'px-1.5 py-0.5' : 'px-3 py-1'

  const cardClass = {
    standard: compact ? 'p-0.5' : 'p-1',
    borderless: '',
    bordered: `border-2 border-gray-900 ${compact ? 'p-0.5' : 'p-1'}`,
    compact: `rounded-md border border-gray-200 ${compact ? 'p-0.5' : 'p-1'}`,
    centered: 'text-center',
    spec: `rounded-md border border-gray-200 bg-[#ffffff] ${compact ? 'p-0.5' : 'p-1.5'}`,
    tile: `rounded-2xl bg-blue-50 ${compact ? 'p-1' : 'p-2'}`,
  }[layout.card] || ''

  const imageClass = {
    compact: 'aspect-square rounded-md bg-gray-200',
    spec: 'aspect-square rounded-md bg-gray-100',
    tile: 'aspect-square rounded-xl bg-[#ffffff]',
    centered: 'aspect-[4/5] rounded-xl bg-blue-100',
  }[layout.card] || 'aspect-[3/4] rounded-md bg-gray-200'

  // The add button each card style uses
  function addButton() {
    switch (layout.card) {
      case 'compact':
        return <span className={`mt-1 block rounded-md bg-blue-600 text-center text-white ${btn}`}>Add</span>
      case 'spec':
        return <span className={`mt-1 block rounded-md bg-blue-600 text-center text-white ${btn}`}>Add to cart</span>
      case 'centered':
        return (
          <span className={`mt-1 inline-block rounded-full border border-blue-600 text-blue-600 ${btn}`}>
            Add to bag
          </span>
        )
      case 'tile':
        return (
          <span
            className={`mt-1 ml-auto flex items-center justify-center rounded-full bg-blue-600 font-bold text-white ${
              compact ? 'h-3 w-3' : 'h-6 w-6'
            }`}
          >
            +
          </span>
        )
      default:
        return <span className={`mt-1 inline-block rounded-md bg-gray-900 text-white ${btn}`}>Add</span>
    }
  }

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
          <span>{set.menu[0]}</span>
          <span>{set.menu[1]}</span>
        </div>
        <span className="font-poppins font-bold tracking-wide">YOUR STORE</span>
        <span className="font-poppins text-gray-600">Cart (0)</span>
      </div>

      {/* Banner */}
      <div className={`bg-gray-700 text-center text-white ${bannerPad}`} style={photos.hero ? { ...photoStyle(photos.hero), boxShadow: 'inset 0 0 0 999px rgba(0,0,0,0.35)' } : undefined}>
        {!photos.hero && <p className={compact ? 'text-[10px] leading-none' : 'text-2xl leading-none'}>{products.slice(0, 3).map((p) => p.icon).join(' ')}</p>}
        <h2 className={`font-poppins mt-1 font-bold ${headline}`}>{set.banner}</h2>
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
                className={`flex shrink-0 items-center justify-center rounded-md ${compact ? 'h-5 w-5 text-[10px]' : 'h-10 w-10 text-xl'}`}
                style={product.photo ? photoStyle(product.photo) : pictureStyle}
              >
                {!product.photo && product.icon}
              </div>
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
        <div className={compact ? 'p-2' : 'p-4'}>
          {layout.search && (
            <div className={`mb-2 flex gap-1`}>
              <span className={`flex-1 rounded-md border border-gray-300 bg-[#ffffff] text-gray-400 ${btn}`}>
                Search products...
              </span>
              <span className={`rounded-md bg-blue-600 text-white ${btn}`}>Search</span>
            </div>
          )}
          <div className={`grid ${gridCols} ${layout.card === 'compact' ? 'gap-1' : 'gap-2'}`}>
            {shown.map((product) => (
              <div key={product.name} className={cardClass}>
                <div className={`${imageClass} flex items-center justify-center ${iconSize}`} style={product.photo ? photoStyle(product.photo) : pictureStyle}>
                  {!product.photo && product.icon}
                </div>
                {layout.card === 'compact' ? (
                  <>
                    <p className="mt-1 font-bold">{product.price}</p>
                    <h3 className="font-epilogue truncate text-gray-600">{product.name}</h3>
                  </>
                ) : (
                  <>
                    <h3 className={`font-epilogue mt-1 truncate font-semibold ${layout.card === 'centered' ? 'font-poppins' : ''}`}>
                      {product.name}
                    </h3>
                    <p className={layout.card === 'spec' ? 'font-bold' : 'text-gray-600'}>{product.price}</p>
                  </>
                )}
                {addButton()}
              </div>
            ))}
          </div>
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