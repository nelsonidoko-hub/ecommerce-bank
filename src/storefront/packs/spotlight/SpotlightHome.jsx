import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`

// The Spotlight homepage: the shop's best seller (or newest product) big,
// with a Buy now button, then the merchant's other sections (without the
// banner). Props come from pages/Home.jsx:
//   settings, sections, renderSection(section), products: { newest, bestSellers }
function SpotlightHome({ settings, sections, renderSection, products }) {
  const star = products.bestSellers[0] || products.newest[0]
  const rest = sections.filter((s) => s.type !== 'hero')

  return (
    <div className="pt-20 sm:pt-28">
      {star ? (
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-16">
          <div className="aspect-square overflow-hidden bg-gray-100 rounded-md">
            <img src={star.image} alt={star.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">{settings.storeName}</p>
            <h1 className="font-poppins mt-2 text-3xl font-bold text-gray-900 sm:text-5xl">{star.name}</h1>
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              {naira(star.price)}
              {star.onSale && star.oldPrice > star.price && <span className="ml-2 text-lg text-gray-400 line-through">{naira(star.oldPrice)}</span>}
            </p>
            {star.description && <p className="mt-4 text-gray-600">{star.description}</p>}
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              {['Pay safely with Paystack', 'Fast delivery', 'Message us on WhatsApp any time'].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600" /> {line}
                </li>
              ))}
            </ul>
            <Link to={`/product/${star._id}`} className="rounded-md mt-8 inline-block bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700">
              Buy now
            </Link>
          </div>
        </section>
      ) : (
        <p className="py-20 text-center text-gray-500">Add a product to see it here.</p>
      )}
      {rest.map(renderSection)}
    </div>
  )
}

export default SpotlightHome
