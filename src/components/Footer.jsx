import { Link } from 'react-router-dom'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { RiInstagramLine, RiTwitterXLine, RiTiktokLine } from 'react-icons/ri'

const resources = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Shipping Policy', to: '/shipping-policy' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Refund Policy', to: '/refund-policy' },
  { label: 'Terms Of Service', to: '/terms' },
]

const support = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: RiInstagramLine },
  { label: 'X', href: 'https://x.com', Icon: RiTwitterXLine },
  { label: 'TikTok', href: 'https://tiktok.com', Icon: RiTiktokLine },
]

function Footer() {
  return (
    <footer className="bg-[#1f1f1f] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-16">
        {/* Columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-10">
          {/* Socials */}
          <div className="col-span-2 md:col-span-1 md:pr-10">
            <h3 className="mb-5 text-base font-bold">SOCIALS</h3>
            <div className="flex items-center gap-4">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="text-gray-300 transition hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-5 text-base font-bold">RESOURCES</h3>
            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-base hover:text-gray-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-5 text-base font-bold">SUPPORT</h3>
            <ul className="space-y-3">
              {support.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-base hover:text-gray-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Store address */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-5 text-base font-bold">STORE ADDRESS</h3>
            <address className="text-base not-italic leading-8">
              Admirlaty Mall
              <br />
              Lekki Phase 1, 2nd Floor,
              <br />
              Lagos, Lagos State
              <br />
              Nigeria
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between md:mt-16">
          <button
            type="button"
            className="flex w-fit items-center gap-3 border border-gray-500 px-4 py-3 text-sm transition hover:border-white"
          >
            <span className="flex h-4 w-6 overflow-hidden">
              <span className="w-1/3 bg-green-600" />
              <span className="w-1/3 bg-white" />
              <span className="w-1/3 bg-green-600" />
            </span>
            <span>NGN ₦</span>
            <ChevronDownIcon className="h-3 w-3" />
          </button>

          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Your Store Name. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer