import React, { useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './routes/AppRoutes';
import theme from './theme/theme';
import './App.css';
import './styles/scroll.css';
import { AuthProvider } from './hooks/useAuth';
import ScrollToTop from './components/common/ScrollToTop';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { LoadingProvider, useLoading } from './contexts/LoadingContext';
import { GlobalLoaderOverlay } from './components/common/Loader';

const ROUTE_MIN_DURATION = 1500;

const RouteChangeListener = () => {
  const location = useLocation();
  const { showLoader, hideLoader, isSuppressed } = useLoading();
  const skipRouteLoader = location.pathname.startsWith('/start-exam') ||
    location.pathname.includes('/take-exam/');

  useEffect(() => {
    if (isSuppressed || skipRouteLoader) {
      hideLoader();
      return undefined;
    }

    let completed = false;

    showLoader();
    const timeoutId = setTimeout(() => {
      completed = true;
      hideLoader();
    }, ROUTE_MIN_DURATION);

    return () => {
      if (!completed) {
        clearTimeout(timeoutId);
        hideLoader();
      }
    };
  }, [location.key, isSuppressed, skipRouteLoader, showLoader, hideLoader]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingProvider>
          <AuthProvider>
            <ThemeProvider>
              <ScrollToTop />
              <RouteChangeListener />
              <GlobalLoaderOverlay />
              <div className="App">
                <Toaster position="top-right" />
                <AppRoutes />
              </div>
            </ThemeProvider>
          </AuthProvider>
        </LoadingProvider>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}

export default App;
