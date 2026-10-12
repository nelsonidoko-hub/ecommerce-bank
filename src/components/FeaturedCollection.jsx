import { Link } from 'react-router-dom'

function MiniCard({ product }) {
  // Adjust these to match your product schema
  const image =
    product.images?.[0]?.url || product.images?.[0] || product.image || ''
  const soldOut = product.countInStock === 0
  const colorCount = product.colors?.length || 0

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="mb-4 h-0.5 w-24 bg-black md:mb-6 md:w-36" />

      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 "
        />
      </div>

      <div className="mt-4 text-sm md:mt-6">
        <p className="text-gray-900 font-poppins">{product.name}</p>
        <p className="text-gray-500 font-epilogue mt-1 text-xs md:mt-2">
          {soldOut ? 'Sold Out' : `₦${Number(product.price).toLocaleString()}.00`}
        </p>
        {colorCount > 1 && (
          <p className="mt-2 italic text-gray-500">{colorCount} Colors</p>
        )}
      </div>
    </Link>
  )
}

function FeaturedCollection({
  products = [],
  image,
  title = 'ZERO TO THE WORLD',
  buttonText = 'VIEW',
  buttonLink = '/shop',
}) {
  return (
    <section className="px-6 py-12 md:px-10 md:py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-8">
        {/* Product grid (2 x 2) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-14">
          {products.slice(0, 4).map((product) => (
            <MiniCard key={product._id} product={product} />
          ))}
        </div>

        {/* Feature image with overlay */}
        <div className="relative min-h-[420px] overflow-hidden lg:min-h-full">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center text-white">
            <h3 className="text-xl font-medium tracking-wide md:text-2xl font-anton">{title}</h3>
            <Link
              to={buttonLink}
              className="mt-8 font-Anton font-medium border border-white px-8 py-3 text-xs tracking-wider transition hover:bg-white hover:text-black"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCollection