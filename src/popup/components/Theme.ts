import { createMuiTheme } from '@material-ui/core';

// copy from https://material-ui.com/zh/customization/palette/
export const signerTheme = createMuiTheme({
  palette: {
    primary: {
      light: '#4791db',
      main: '#1976d2',
      dark: '#115293'
    },
    secondary: {
      light: '#e33371',
      main: '#dc004e',
      dark: '#9a0036'
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f'
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00'
    },
    info: {
      light: '#64b5f6',
      main: '#2196f3',
      dark: '#1976d2'
    },
    success: {
      light: '#81c784',
      main: '#4caf50',
      dark: '#388e3c'
    }
  }
});
