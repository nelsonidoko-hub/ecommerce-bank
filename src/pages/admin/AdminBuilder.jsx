import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { getDraft, saveDraft, publishDraft, discardDraft, getTemplateHomepage } from '../../services/settingsService'
import { getFlatCategories } from '../../services/categoryService'
import { setCachedSettings, useSettings } from '../../hooks/useSettings'
import { useStoreStatus } from '../../hooks/useStoreStatus'
import { shopHref } from '../../utils/storeContext'
import SectionList from '../../components/builder/SectionList'
import ThemeEditor, { themeBlocked } from '../../components/builder/ThemeEditor'
import MyTemplates from '../../components/builder/MyTemplates'

const TABS = [
  ['sections', 'Sections'],
  ['design', 'Design'],
  ['templates', 'My templates'],
]
const message = (err, fallback) => err?.response?.data?.message || fallback

// The builder: change the homepage sections and the look, see it live beside
// the editor, and publish when happy. Everything is saved as a draft while you
// work; customers only see it after "Publish changes".
function AdminBuilder() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(TABS.some(([id]) => id === params.get('tab')) ? params.get('tab') : 'sections')
  const [design, setDesign] = useState(null)
  const [hasDraft, setHasDraft] = useState(false)
  const [save, setSave] = useState('idle') // idle | saving | saved | error
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [homepageBusy, setHomepageBusy] = useState(false)
  const [busy, setBusy] = useState('')
  const [device, setDevice] = useState('desktop')
  const [mobilePreview, setMobilePreview] = useState(false)
  const [categories, setCategories] = useState([])

  const { settings: live } = useSettings()
  const status = useStoreStatus()
  const isPro = status?.manage?.plan === 'pro'

  const frame = useRef(null)
  const latest = useRef(null)
  const timer = useRef(null)
  const saving = useRef(Promise.resolve())

  // Push the design into the preview straight away (no reload)
  const push = useCallback((d) => {
    frame.current?.contentWindow?.postMessage({ type: 'builder:design', theme: d.theme, homeSections: d.homeSections }, window.location.origin)
  }, [])

  const load = useCallback(async () => {
    const d = await getDraft()
    latest.current = d
    setDesign(d)
    setHasDraft(d.hasDraft)
    push(d)
  }, [push])

  useEffect(() => {
    load().catch((err) => setError(message(err, 'Could not load your design.')))
    getFlatCategories().then((c) => setCategories(Array.isArray(c) ? c : [])).catch(() => {})
  }, [load])

  // The preview asks for the latest design once it has loaded
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin === window.location.origin && event.data?.type === 'builder:ready' && latest.current) push(latest.current)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [push])

  // Save the draft a moment after the last change
  function flush() {
    clearTimeout(timer.current)
    const d = latest.current
    saving.current = saving.current
      .then(() => saveDraft({ theme: d.theme, homeSections: d.homeSections }))
      .then(() => {
        setHasDraft(true)
        setSave('saved')
        setError('')
      })
      .catch((err) => {
        setSave('error')
        setError(message(err, 'Could not save your changes.'))
      })
    return saving.current
  }

  function change(next) {
    latest.current = next
    setDesign(next)
    setNotice('')
    push(next)
    setSave('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(flush, 800)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  const sections = design?.homeSections || []
  const setSections = (list) => change({ ...design, homeSections: list })

  // The chosen template's own homepage, made ready for this shop, into the draft
  async function applyTemplateHomepage(template) {
    setHomepageBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await getTemplateHomepage(template)
      change({ ...design, homeSections: data.homeSections })
      setTab('sections')
      setNotice("Done: the template's homepage is in your draft. Look it over, then Publish.")
    } catch (err) {
      setError(message(err, "Could not load the template's homepage."))
    } finally {
      setHomepageBusy(false)
    }
  }

  async function publish() {
    setBusy('publish')
    setError('')
    try {
      if (save === 'saving') await flush()
      await saving.current
      const result = await publishDraft()
      setCachedSettings(result.settings)
      latest.current = result
      setDesign(result)
      setHasDraft(false)
      setSave('idle')
      setNotice('Published! Customers now see your new design.')
    } catch (err) {
      setError(message(err, 'Could not publish.'))
    } finally {
      setBusy('')
    }
  }

  async function discard() {
    setBusy('discard')
    clearTimeout(timer.current)
    try {
      await saving.current
      const d = await discardDraft()
      latest.current = d
      setDesign(d)
      setHasDraft(false)
      setSave('idle')
      push(d)
      setNotice('Changes discarded. This is your live design.')
    } catch (err) {
      setError(message(err, 'Could not discard.'))
    } finally {
      setBusy('')
    }
  }

  if (!design) {
    return <p className="p-6 text-sm text-gray-500">{error || 'Loading the builder…'}</p>
  }

  const blocked = themeBlocked(design.theme)
  const unpublished = hasDraft || save === 'saving'
  const saveText = { saving: 'Saving…', saved: 'Draft saved', error: 'Not saved', idle: hasDraft ? 'Draft saved' : 'Up to date' }[save]

  const panel = (
    <>
      <div className="flex border-b border-gray-200">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 px-3 py-3 text-sm font-medium ${tab === id ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'sections' && <SectionList sections={sections} onChange={setSections} categories={categories} />}

        {tab === 'design' && (
          <ThemeEditor
            value={design.theme}
            liveTemplate={live?.theme?.template}
            onChange={(theme) => change({ ...design, theme })}
            onUseHomepage={applyTemplateHomepage}
            homepageBusy={homepageBusy}
          />
        )}

        {tab === 'templates' && <MyTemplates isPro={isPro} onApplied={load} />}
      </div>
    </>
  )

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col sm:-m-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <div className="mr-auto">
          <h1 className="text-lg font-bold text-gray-900">Builder</h1>
          <p className={`text-xs ${save === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
            {saveText}
            {unpublished && save !== 'error' && ' · not live yet'}
          </p>
        </div>
        <div className="hidden rounded-md border border-gray-200 p-0.5 lg:flex">
          <button type="button" aria-label="Laptop view" onClick={() => setDevice('desktop')} className={`rounded p-1.5 ${device === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>
            <ComputerDesktopIcon className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Phone view" onClick={() => setDevice('phone')} className={`rounded p-1.5 ${device === 'phone' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>
            <DevicePhoneMobileIcon className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={() => setMobilePreview(!mobilePreview)} className="rounded-md border px-3 py-2 text-sm lg:hidden">
          {mobilePreview ? 'Edit' : 'Preview'}
        </button>
        {unpublished && (
          <button type="button" onClick={discard} disabled={Boolean(busy)} className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={publish}
          disabled={!unpublished || blocked || Boolean(busy)}
          title={blocked ? 'Choose a darker brand colour first' : undefined}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy === 'publish' ? 'Publishing…' : 'Publish changes'}
        </button>
      </div>

      {(error || notice) && (
        <p className={`px-4 py-2 text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>{error || notice}</p>
      )}

      <div className="flex min-h-0 flex-1">
        <aside className={`w-full shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 lg:block lg:w-[380px] ${mobilePreview ? 'hidden' : 'block'}`}>{panel}</aside>
        <div className={`min-w-0 flex-1 items-start justify-center overflow-auto bg-gray-200 p-4 lg:flex ${mobilePreview ? 'flex' : 'hidden'}`}>
          <iframe
            ref={frame}
            title="Shop preview"
            src={shopHref('/?preview=1')}
            className={`h-full rounded-lg border border-gray-300 bg-white shadow-sm ${device === 'phone' ? 'w-[390px]' : 'w-full'}`}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminBuilder
