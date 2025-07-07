import { createTheme } from '@mui/material/styles';

// Custom theme with the specified light purple shade (#dabcff)
const theme = createTheme({
  palette: {
    primary: {
      main: '#6c5ce7', // Changed to darker purple
      contrastText: '#ffffff', // White text for better contrast
    },
    secondary: {
      main: '#6c5ce7',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          color: '#fff', // Ensure white text on primary buttons
          backgroundColor: '#6c5ce7',
          '&:hover': {
            backgroundColor: '#5a4bcf', // Uniform hover color for all contained primary buttons
          },
        },
        containedSecondary: {
          color: '#fff',
          backgroundColor: '#6c5ce7',
          '&:hover': {
            backgroundColor: '#5a4bcf', // Uniform hover color for all contained secondary buttons
          },
        },
      },
    },
  },
});

export default theme;
