import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './routes/AppRoutes';
import theme from './theme/theme';
import './App.css';
import './styles/scroll.css';
import { AuthProvider } from './hooks/useAuth';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <ThemeProvider>
            <div className="App">
              <Toaster position="top-right" />
              <AppRoutes />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}

export default App;
