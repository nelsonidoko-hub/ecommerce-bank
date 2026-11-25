import { Link } from 'react-router-dom'
import {
  CreditCardIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  TagIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import ThemePreview from '../../components/ThemePreview'
import TemplateCard from '../components/TemplateCard'
import { TEMPLATE_LIST } from '../../utils/themes'
import { useAllTemplates } from '../usePlatformData'
import { PLATFORM_NAME } from '../../utils/storeContext'
import { usePlans, useDemos, naira } from '../usePlatformData'

const STEPS = [
  ['Pick a design', 'Choose from ready-made templates for fashion, food, beauty, gadgets, kids and more.'],
  ['Make it yours', 'Add your logo, products and prices. Change colours and fonts. Your shop comes with sample products so you can see how it looks.'],
  ['Start selling', 'Connect Paystack, or start with bank transfer or pay on delivery, and publish. Customers pay you directly.'],
]

const FEATURES = [
  [CreditCardIcon, 'Paid straight to you', "Customers pay through your own Paystack account. We never touch your money."],
  [DevicePhoneMobileIcon, 'Made for phones', 'Most of your customers shop on their phones. Every template is built for that first.'],
  [TruckIcon, 'Orders and delivery', 'Track every order, mark it shipped or ready for pickup, and customers get an email each step.'],
  [TagIcon, 'Discount codes', 'Run promotions with percentage or fixed-amount codes, limits and expiry dates.'],
  [GlobeAltIcon, 'Your own address', 'Every shop gets its own web address to share. On Pro, use your own .com.'],
  [EnvelopeIcon, 'Emails sent for you', 'Order confirmations, status updates and password resets go out in your shop’s name.'],
]

// What each plan includes, worded for merchants
function planFeatures(plan, trialDays) {
  return [
    'All templates',
    plan.productLimit ? `Up to ${plan.productLimit} products` : 'Unlimited products',
    'Orders, customers and discount codes',
    'Paystack payments to your account',
    plan.customDomain ? 'Use your own .com address' : 'Your own shop address',
    plan.staffAccounts ? 'Staff accounts' : null,
    plan.ownTemplates ? 'Save your own designs' : null,
    plan.poweredBy ? `Small “Powered by ${PLATFORM_NAME}” line` : `No ${PLATFORM_NAME} branding`,
    `${trialDays}-day free trial when you publish`,
  ].filter(Boolean)
}

function Landing() {
  const plans = usePlans()
  const demos = useDemos()
  const templateCount = useAllTemplates().length
  const showcase = TEMPLATE_LIST.filter((t) => ['fresh', 'glow', 'tech', 'catalog'].includes(t.id))

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-2 md:pt-20">
        <div>
          <p className="mb-4 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            Free to build. Pay only when you go live.
          </p>
          <h1 className="font-poppins text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            Your online shop, ready today.
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            Pick a design, add your products and start selling with Paystack. No coding, no developer, no waiting.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">
              Start your shop free
            </Link>
            <Link to="/templates" className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50">
              See templates
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="rotate-2 overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
            <ThemePreview theme={{ template: 'fresh' }} />
          </div>
          <div className="absolute -bottom-8 -left-6 hidden w-56 -rotate-3 overflow-hidden rounded-xl border border-slate-200 shadow-lg sm:block">
            <ThemePreview theme={{ template: 'glow' }} compact />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-poppins text-3xl font-bold text-slate-900">Three steps to your first sale</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 font-poppins text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Templates */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-poppins text-3xl font-bold text-slate-900">A design for every kind of shop</h2>
              <p className="mt-2 text-slate-600">{templateCount} templates, each fully yours to change.</p>
            </div>
            <Link to="/templates" className="font-semibold text-emerald-700 hover:underline">
              See all {templateCount} templates →
            </Link>
          </div>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {showcase.map((t) => (
              <TemplateCard key={t.id} template={t} demoUrl={demos[t.id]} startTo={`/signup?template=${t.id}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-poppins text-3xl font-bold">Everything a Nigerian shop needs</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([Icon, title, text]) => (
              <div key={title}>
                <Icon className="h-7 w-7 text-emerald-400" />
                <h3 className="mt-3 font-poppins text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-center font-poppins text-3xl font-bold text-slate-900">Simple monthly pricing</h2>
          <p className="mt-2 text-center text-slate-600">
            Build and preview for free, as long as you like. Pay only to keep your shop live
            {plans ? ` after your ${plans.trialDays}-day free trial` : ''}.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {(plans?.plans || []).map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-6 ${plan.id === 'pro' ? 'border-emerald-600 shadow-lg' : 'border-slate-200'}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins text-xl font-bold text-slate-900">{plan.name}</h3>
                  {plan.id === 'pro' && <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
                </div>
                <p className="mt-4">
                  <span className="font-poppins text-4xl font-bold text-slate-900">{naira(plan.price)}</span>
                  <span className="text-slate-500"> / month</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2">
                  {planFeatures(plan, plans.trialDays).map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-slate-700">
                      <CheckIcon className="h-5 w-5 shrink-0 text-emerald-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`mt-8 rounded-lg px-4 py-3 text-center font-semibold ${plan.id === 'pro' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border border-slate-300 text-slate-800 hover:bg-slate-50'}`}
                >
                  Start free
                </Link>
              </div>
            ))}
            {plans?.failed && <p className="text-center text-slate-500 md:col-span-2">Prices couldn't load. Please refresh.</p>}
          </div>
        </div>
      </section>

      <section className="bg-emerald-600 py-14 text-center text-white">
        <h2 className="font-poppins text-3xl font-bold">Ready to open your shop?</h2>
        <p className="mt-2 text-emerald-50">It takes about five minutes to set up.</p>
        <Link to="/signup" className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-50">
          Start free
        </Link>
      </section>
    </>
  )
}

export default Landing
