import Typography from 'typography'
import GrandViewTheme from 'typography-theme-grand-view'

GrandViewTheme.overrideStyles = () => ({
  'p': {
    letterSpacing: '1px',
  },
})

const typography = new Typography(GrandViewTheme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
