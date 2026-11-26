import ProductCard from './ProductCard'
import { useStoreTheme } from '../hooks/useStoreTheme'
import { ListLayoutContext } from '../context/ListLayoutContext'

// Desktop columns per template. Written out in full so Tailwind keeps the classes.
const COLUMNS = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  // Catalog: three across on tablets, five on wide screens
  5: 'md:grid-cols-3 lg:grid-cols-5',
}

// Lays a list of products out the way the chosen template asks:
// a grid of cards, or (for list templates) one menu row per product.
function ProductGrid({ products = [] }) {
  const { layout } = useStoreTheme()

  if (layout.grid === 'list') {
    return (
      <ListLayoutContext.Provider value={true}>
        <div className="grid grid-cols-1 gap-x-8 lg:grid-cols-2 font-epilogue">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </ListLayoutContext.Provider>
    )
  }

  return (
    <div
      className={`sf-grid grid grid-cols-1 min-[321px]:grid-cols-2 ${
        // dense cards sit closer together so more fit on screen
        layout.card === 'compact' ? 'gap-2 md:gap-3' : 'gap-3 md:gap-6'
      } ${
        COLUMNS[layout.columns] || COLUMNS[4]
      } font-epilogue`}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
