import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { RiInstagramLine, RiTwitterXLine, RiTiktokLine } from 'react-icons/ri'
import { useSettings } from '../hooks/useSettings'
import { getFooterPages } from '../services/pageService'

const fallbackResources = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Shipping Policy', to: '/shipping-policy' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Refund Policy', to: '/refund-policy' },
  { label: 'Terms Of Service', to: '/terms' },
]

const fallbackSupport = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

const socialIcons = {
  instagram: { label: 'Instagram', Icon: RiInstagramLine },
  x: { label: 'X', Icon: RiTwitterXLine },
  tiktok: { label: 'TikTok', Icon: RiTiktokLine },
}

const withProtocol = (url) => (/^https?:\/\//.test(url) ? url : `https://${url}`)

function Footer() {
  const { settings } = useSettings()

  // Footer links come from the Pages in admin. If that request fails, the
  // fixed lists above are used so the footer is never empty.
  const [pages, setPages] = useState(null)
  useEffect(() => {
    getFooterPages()
      .then((data) => setPages(Array.isArray(data) ? data : null))
      .catch((err) => console.error('Could not load footer pages', err))
  }, [])

  const linksFor = (column, fallback) =>
    pages
      ? pages
          .filter((page) => page.footerColumn === column)
          .map((page) => ({ label: page.title, to: `/${page.slug}` }))
      : fallback

  const resources = linksFor('resources', fallbackResources)
  const support = linksFor('support', fallbackSupport)
  const { address, social, contactEmail, contactPhone, storeName } = settings

  // Only show social icons that have a link filled in
  const socials = Object.entries(socialIcons)
    .filter(([key]) => social[key])
    .map(([key, value]) => ({ key, href: withProtocol(social[key]), ...value }))

  const cityLine = [address.city, address.state].filter(Boolean).join(', ')
  const addressLines = [address.line1, cityLine, address.country].filter(Boolean)

  return (
    <footer className="bg-[#1f1f1f] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-10">
          {/* Socials */}
          <div className="col-span-2 md:col-span-1 md:pr-10">
            <h3 className="mb-5 text-base font-bold">SOCIALS</h3>
            {socials.length > 0 ? (
              <div className="flex items-center gap-4">
                {socials.map(({ key, label, href, Icon }) => (
                  <a
                    key={key}
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
            ) : (
              <p className="text-sm text-gray-500">Follow us soon</p>
            )}
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
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`} className="text-base hover:text-gray-300 break-all">
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li>
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="text-base hover:text-gray-300">
                    {contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Store address */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-5 text-base font-bold">STORE ADDRESS</h3>
            {addressLines.length > 0 ? (
              <address className="text-base not-italic leading-8">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ) : (
              <p className="text-sm text-gray-500">Address coming soon</p>
            )}
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
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer