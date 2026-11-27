import BloomHome from './BloomHome'

// Bloom: a clean one-category shop (adapted from an MIT-licensed design by
// Bloomtpl, distributed by ThemeWagon)
export default {
  id: 'bloom',
  label: 'Bloom',
  parts: {
    home: {
      bloom: {
        label: 'Headline and grid (Bloom pack)',
        help: 'No banner: a big centred headline (your first text section), then a clean product grid',
        Component: BloomHome,
      },
    },
  },
}
