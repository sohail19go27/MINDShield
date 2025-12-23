import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7c3aed', // violet
      contrastText: '#fff'
    },
    secondary: {
      main: '#06b6d4'
    },
    background: {
      default: '#0f172a'
    }
  },
  typography: {
    fontFamily: 'Inter, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial',
    h2: { fontWeight: 800 },
    h4: { fontWeight: 700 }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      }
    }
  }
})

export default theme
