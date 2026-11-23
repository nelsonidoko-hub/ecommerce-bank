import TemplateCard from '../components/TemplateCard'
import { TEMPLATE_LIST } from '../../utils/themes'
import { useDemos } from '../usePlatformData'
import { getAccount } from '../../services/platformService'

// Every template, with a live demo shop for each
function Templates() {
  const demos = useDemos()
  // Signed-in merchants add a shop; new visitors sign up
  const startPath = getAccount() ? '/new-shop' : '/signup'

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-poppins text-4xl font-bold text-slate-900">Templates</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Every template is a complete shop. Open a demo to click around as a customer would, then start yours with the
        one you like. You can change colours, fonts and corners, or switch templates, any time.
      </p>
      <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TEMPLATE_LIST.map((t) => (
          <TemplateCard key={t.id} template={t} demoUrl={demos[t.id]} startTo={`${startPath}?template=${t.id}`} />
        ))}
      </div>
    </section>
  )
}

export default Templates
