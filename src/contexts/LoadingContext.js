import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';

const MINIMUM_VISIBLE_TIME = 1500;

const LoadingContext = createContext({
  isLoading: false,
  isSuppressed: false,
  showLoader: () => {},
  hideLoader: () => {},
  withLoader: async () => {},
  disableLoader: () => {},
  enableLoader: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const activeRequestsRef = useRef(0);
  const timerRef = useRef(null);
  const visibleSinceRef = useRef(0);
  const suppressionRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isSuppressed, setIsSuppressed] = useState(false);

  const clearScheduledHide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showLoader = useCallback(() => {
    if (suppressionRef.current > 0) {
      return;
    }

    clearScheduledHide();

    if (activeRequestsRef.current === 0) {
      visibleSinceRef.current = Date.now();
      setIsVisible(true);
    }

    activeRequestsRef.current += 1;
  }, [clearScheduledHide]);

  const hideLoader = useCallback(() => {
    if (suppressionRef.current > 0) {
      return;
    }

    if (activeRequestsRef.current === 0) {
      return;
    }

    activeRequestsRef.current -= 1;

    if (activeRequestsRef.current > 0) {
      return;
    }

    const elapsed = Date.now() - (visibleSinceRef.current || 0);
    const remaining = Math.max(MINIMUM_VISIBLE_TIME - elapsed, 0);

    if (remaining === 0) {
      setIsVisible(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      timerRef.current = null;
    }, remaining);
  }, []);

  const withLoader = useCallback(
    async (operation) => {
      showLoader();
      try {
        if (typeof operation === 'function') {
          return await operation();
        }
        return await operation;
      } finally {
        hideLoader();
      }
    },
    [showLoader, hideLoader]
  );

  const disableLoader = useCallback(() => {
    suppressionRef.current += 1;

    if (suppressionRef.current === 1) {
      clearScheduledHide();
      activeRequestsRef.current = 0;
      visibleSinceRef.current = 0;
      setIsVisible(false);
      setIsSuppressed(true);
    }
  }, [clearScheduledHide]);

  const enableLoader = useCallback(() => {
    if (suppressionRef.current === 0) {
      return;
    }

    suppressionRef.current -= 1;

    if (suppressionRef.current === 0) {
      setIsSuppressed(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearScheduledHide();
      timerRef.current = null;
    };
  }, [clearScheduledHide]);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        showLoader();
        return config;
      },
      (error) => {
        hideLoader();
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        hideLoader();
        return response;
      },
      (error) => {
        hideLoader();
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [showLoader, hideLoader]);

  const contextValue = useMemo(
    () => ({
      isLoading: isVisible,
      isSuppressed,
      showLoader,
      hideLoader,
      withLoader,
      disableLoader,
      enableLoader,
    }),
    [isVisible, isSuppressed, showLoader, hideLoader, withLoader, disableLoader, enableLoader]
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
