import FurnishHome from './FurnishHome'

// Furnish: a furniture shop's homepage (adapted from an MIT-licensed design
// by CodesCandy, distributed by ThemeWagon)
export default {
  id: 'furnish',
  label: 'Furnish',
  parts: {
    home: {
      furnish: {
        label: 'Furniture showroom (Furnish pack)',
        help: 'A slider of your best pieces, a big "favourite collection" slider, then a customer review over a large photo',
        Component: FurnishHome,
      },
    },
  },
}
