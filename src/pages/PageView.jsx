import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPage } from '../services/pageService'
import { useSettings } from '../hooks/useSettings'
import { toWhatsAppNumber } from '../components/WhatsAppWidget'

// Turns the owner's plain text into headings, bullet lists and paragraphs.
// Everything is rendered as text by React, so nothing typed here can inject HTML.
//   blank line  -> new paragraph
//   "## Title"  -> heading
//   "- item"    -> bullet point
// Groups consecutive lines into bullet lists and paragraphs
function renderLines(lines, keyPrefix) {
  const groups = []
  for (const line of lines) {
    const isItem = line.startsWith('- ')
    const last = groups[groups.length - 1]
    if (last && last.isList === isItem) last.lines.push(line)
    else groups.push({ isList: isItem, lines: [line] })
  }

  return groups.map((group, i) =>
    group.isList ? (
      <ul key={`${keyPrefix}-${i}`} className="list-disc pl-6 space-y-1 text-gray-700">
        {group.lines.map((line, j) => (
          <li key={j}>{line.slice(2)}</li>
        ))}
      </ul>
    ) : (
      <p key={`${keyPrefix}-${i}`} className="text-gray-700 whitespace-pre-line">
        {group.lines.join('\n')}
      </p>
    )
  )
}

function renderContent(text) {
  const blocks = String(text || '').replace(/\r\n/g, '\n').split(/\n{2,}/)

  return blocks.map((block, index) => {
    const lines = block.split('\n').filter((line) => line.trim() !== '')
    if (lines.length === 0) return null

    if (lines[0].startsWith('## ')) {
      return (
        <div key={index} className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 mt-2">{lines[0].slice(3)}</h2>
          {renderLines(lines.slice(1), index)}
        </div>
      )
    }

    return (
      <div key={index} className="space-y-2">
        {renderLines(lines, index)}
      </div>
    )
  })
}

function ContactCard({ settings }) {
  const { contactEmail, contactPhone, whatsappNumber, address } = settings
  const whatsapp = toWhatsAppNumber(whatsappNumber)
  const cityLine = [address.city, address.state].filter(Boolean).join(', ')
  const addressLines = [address.line1, cityLine, address.country].filter(Boolean)

  const rows = [
    contactEmail && {
      label: 'Email',
      node: (
        <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline break-all">
          {contactEmail}
        </a>
      ),
    },
    contactPhone && {
      label: 'Phone',
      node: (
        <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">
          {contactPhone}
        </a>
      ),
    },
    whatsapp.length >= 8 && {
      label: 'WhatsApp',
      node: (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Message us on WhatsApp
        </a>
      ),
    },
    addressLines.length > 0 && {
      label: 'Visit us',
      node: (
        <span className="text-gray-700">
          {addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </span>
      ),
    },
  ].filter(Boolean)

  if (rows.length === 0) return null

  return (
    <div className="mt-8 border rounded-xl divide-y">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-4 p-4 text-sm">
          <span className="w-20 shrink-0 text-gray-500">{row.label}</span>
          {row.node}
        </div>
      ))}
    </div>
  )
}

function PageView() {
  const { slug } = useParams()
  const { settings } = useSettings()
  const [page, setPage] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | notfound | error

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getPage(slug)
      .then((data) => {
        if (cancelled) return
        setPage(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus(err.response?.status === 404 ? 'notfound' : 'error')
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (status === 'ready' && page) {
      document.title = `${page.title} | ${settings.storeName}`
    }
  }, [status, page, settings.storeName])

  if (status === 'loading') {
    return <p className="pt-32 pb-16 text-center text-gray-500">Loading...</p>
  }

  if (status !== 'ready') {
    return (
      <div className="pt-32 pb-24 px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === 'notfound' ? "We couldn't find that page" : 'Something went wrong'}
        </h1>
        <p className="text-gray-500 mb-6">
          {status === 'notfound'
            ? 'The link may be old, or the page may have moved.'
            : 'Please try again in a moment.'}
        </p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800"
        >
          Back to the store
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
        <div className="space-y-4 leading-relaxed">{renderContent(page.content)}</div>
        {page.slug === 'contact' && <ContactCard settings={settings} />}
      </div>
    </div>
  )
}

export default PageView