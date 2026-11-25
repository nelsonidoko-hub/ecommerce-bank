import SpotlightHome from './SpotlightHome'

// Example pack: a homepage for shops that sell one main product
export default {
  id: 'spotlight',
  label: 'Spotlight',
  parts: {
    home: {
      spotlight: {
        label: 'Single product (Spotlight pack)',
        help: 'One big product with a Buy now button, then the rest of the shop',
        Component: SpotlightHome,
      },
    },
  },
}
