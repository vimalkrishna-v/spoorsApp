import { createTheme } from '@mui/material/styles';

// Custom theme with the specified light purple shade (#dabcff)
const theme = createTheme({
  palette: {
    primary: {
      main: '#dabcff', // Light purple shade
      contrastText: '#000000', // Black text for better contrast on light purple
    },
    secondary: {
      main: '#6c5ce7', // A complementary darker purple
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#c9abee', // Slightly darker shade for hover state
          },
        },
      },
    },
  },
});

export default theme;
