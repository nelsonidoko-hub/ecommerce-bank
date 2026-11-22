import { createContext } from 'react'

// True only inside a ProductGrid that is showing products as menu rows.
// A product card checks it, so menu rows never appear in a carousel or on a
// page that lays its own products out, where they would look cramped.
export const ListLayoutContext = createContext(false)