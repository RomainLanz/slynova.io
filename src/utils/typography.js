import Typography from 'typography'

const typography = new Typography({
  baseFontSize: '19px',
  baseLineHeight: '37px',
  headerFontFamily: ['Fira Sans'],
  bodyFontFamily: ['Fira Sans'],
  googleFonts: [{
    name: 'Fira Sans',
    styles: ['400', '400i', '700', '700i']
  }],
  overrideStyles:() => ({
    'a.gatsby-resp-image-link': {
      boxShadow: 'none',
    },
    'p a': {
      color: 'inherit',
      outline: 'none',
      textDecoration: 'none',
      transition: 'all .2s ease-out',
      background: 'linear-gradient(#306fae, #306fae)',
      backgroundSize: '100% .2em',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left 0 bottom 0',
    },
    'a.anchor': {
      boxShadow: 'none',
    },
    'p code': {
      fontSize: '1.1rem'
    },
    'li code': {
      fontSize: '1rem'
    },
    'h1': {
      fontSize: '90px',
    },
  })
})

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
