import { useEffect, useState } from 'react'
import { getDemos, getPlans, getStudioGallery } from '../services/platformService'
import { TEMPLATE_LIST, recipeTemplate } from '../utils/themes'

// Plans (prices from the server's Render settings) and the demo shop for each
// template. Loaded once and shared between pages.
let plansCache = null
let demosCache = null
let studioCache = null

export function usePlans() {
  const [data, setData] = useState(plansCache)
  useEffect(() => {
    if (plansCache) return
    getPlans()
      .then((d) => setData((plansCache = d)))
      .catch(() => setData({ plans: [], trialDays: 7, failed: true }))
  }, [])
  return data
}

// { [templateId]: demoUrl }
export function useDemos() {
  const [data, setData] = useState(demosCache || {})
  useEffect(() => {
    if (demosCache) return
    getDemos()
      .then((list) => setData((demosCache = Object.fromEntries(list.map((d) => [d.template, d.url])))))
      .catch(() => setData({}))
  }, [])
  return data
}

// Every template in the gallery: the 8 built-in ones, then the ones published
// from the Template Studio (they load from the server)
export function useAllTemplates() {
  const [studio, setStudio] = useState(studioCache || [])
  useEffect(() => {
    if (studioCache) return
    getStudioGallery()
      .then((list) => setStudio((studioCache = list.map((t) => ({ ...recipeTemplate(t.id, t.recipe, t), builtIn: t.builtIn || '' })).filter((t) => t.layout))))
      .catch(() => setStudio([]))
  }, [])
  // An edited built-in takes the original's place; new ones go after the 8
  const edited = new Map(studio.filter((t) => t.builtIn).map((t) => [t.builtIn, t]))
  return [...TEMPLATE_LIST.map((t) => edited.get(t.id) || t), ...studio.filter((t) => !t.builtIn)]
}
export const forgetStudioGallery = () => {
  studioCache = null
}

// What ThemePreview needs to draw any template (built-in or Studio)
export const previewTheme = (t) => ({ template: t.id, recipe: t.studio ? t : undefined, sampleSet: t.sampleSet, pictures: t.pictures })

export const naira = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`
