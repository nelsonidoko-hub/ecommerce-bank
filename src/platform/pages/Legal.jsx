import { Link } from 'react-router-dom'
import { PLATFORM_NAME, PLATFORM_DOMAIN } from '../../utils/storeContext'

// Starter Terms and Acceptable Use. Plain-English drafts to get going:
// have a Nigerian lawyer review them before you take real merchants.
// Edit the text below; the platform name fills in by itself.
const UPDATED = '23 November 2026'
const CONTACT = `support@${PLATFORM_DOMAIN || 'yourplatform.com'}`

function Page({ title, children }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-poppins text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated {UPDATED}</p>
      <div className="mt-8 space-y-6 leading-relaxed text-slate-700 [&_h2]:mt-8 [&_h2]:font-poppins [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  )
}

export function Terms() {
  const P = PLATFORM_NAME
  return (
    <Page title={`${P} Terms of Service`}>
      <p>
        These terms are an agreement between you (the merchant) and {P}. By creating an account you agree to them. If you
        don't agree, please don't use {P}.
      </p>
      <h2>1. What {P} does</h2>
      <p>
        {P} lets you build and run an online shop: templates, a builder, product and order tools, and a web address. You
        sell your own products to your own customers. {P} is not the seller and is not a party to your sales.
      </p>
      <h2>2. Your account</h2>
      <ul>
        <li>Give true details and keep your password safe. You're responsible for what happens under your account, including staff you add.</li>
        <li>You must be at least 18 and able to enter a contract.</li>
        <li>Tell us quickly at {CONTACT} if you think someone else has got into your account.</li>
      </ul>
      <h2>3. Plans, trial and payment</h2>
      <ul>
        <li>Building and previewing a shop is free. When you publish, a free trial starts. After the trial, a paid plan keeps the shop open.</li>
        <li>Plans are billed monthly in advance, in Naira, through Paystack. Prices are shown on the Pricing section and in your shop's Billing page and may change; we'll give at least 30 days' notice of a price change.</li>
        <li>If you turn on automatic renewal, we charge your saved card at the start of each period. You can turn it off any time in Billing.</li>
        <li>If a payment fails, the shop stays open for a short grace period. If it is still unpaid after that, the shop is paused (hidden from customers). Your data is kept and the shop reopens when you pay.</li>
        <li>Payments already made are not refunded for part-months, except where the law requires it.</li>
      </ul>
      <h2>4. Your shop's payments</h2>
      <p>
        Your customers pay you through your own Paystack account. Paystack's terms apply to those payments. {P} does not
        hold your customers' money and isn't responsible for Paystack payouts, chargebacks or disputes.
      </p>
      <h2>5. Your content and your customers</h2>
      <ul>
        <li>You own your products, pictures, text and customer list. You give {P} permission to store and display them so your shop works.</li>
        <li>You are responsible for what you sell: accurate descriptions, prices, delivery, returns, taxes and any licences you need.</li>
        <li>You must handle your customers' personal data lawfully, including under the Nigeria Data Protection Act 2023.</li>
        <li>You must follow the <Link to="/acceptable-use" className="font-semibold text-emerald-700">Acceptable Use Policy</Link>.</li>
      </ul>
      <h2>6. Suspension and closing</h2>
      <p>
        We may suspend a shop that breaks these terms or the Acceptable Use Policy, puts customers at risk, or that we are
        legally required to take down. Where we can, we'll tell you why first. You can stop using {P} at any time.
      </p>
      <h2>7. Custom domains</h2>
      <p>
        On plans that include it, you can connect a domain you own. You keep paying for the domain itself with your domain
        company. If your plan stops including it, the shop keeps working on its {P} address.
      </p>
      <h2>8. Availability and liability</h2>
      <p>
        We work to keep {P} running, but we can't promise it will never be interrupted. To the extent the law allows, {P} is
        provided "as is", and our total liability to you is limited to the fees you paid us in the 3 months before the
        claim. We are not liable for lost profits or indirect losses.
      </p>
      <h2>9. Changes</h2>
      <p>We may update these terms. If a change is significant, we'll email you before it takes effect.</p>
      <h2>10. Law and contact</h2>
      <p>These terms are governed by the laws of the Federal Republic of Nigeria. Questions: {CONTACT}.</p>
    </Page>
  )
}

export function AcceptableUse() {
  const P = PLATFORM_NAME
  return (
    <Page title="Acceptable Use Policy">
      <p>To keep {P} safe for merchants and shoppers, shops on {P} must not sell, promote or contain:</p>
      <ul>
        <li>Anything illegal in Nigeria, or in the place you sell to.</li>
        <li>Counterfeit or fake branded goods, or anything that infringes someone else's copyright or trademark.</li>
        <li>Drugs, prescription medicines without the required licence, or drug paraphernalia.</li>
        <li>Weapons, ammunition, explosives or their parts.</li>
        <li>Adult sexual content or services.</li>
        <li>Stolen goods, or personal data, accounts or documents belonging to other people.</li>
        <li>Gambling, betting, pyramid or "get rich quick" schemes, or unlicensed financial services.</li>
        <li>Content that promotes hate, violence or harassment.</li>
      </ul>
      <h2>You also must not</h2>
      <ul>
        <li>Take customers' money for goods you don't intend to deliver, or mislead customers about what they're buying.</li>
        <li>Pretend to be another business or person, or copy another shop to trick customers.</li>
        <li>Use {P} to send spam or phishing, or upload malware.</li>
        <li>Try to get into other shops' data or accounts, or overload or attack the service.</li>
      </ul>
      <h2>What happens if a shop breaks this policy</h2>
      <p>
        We may remove content or suspend the shop. The shop's owner sees the reason in their admin. Serious cases, such as
        fraud, may be reported to the authorities. To report a shop, email {CONTACT}.
      </p>
    </Page>
  )
}
