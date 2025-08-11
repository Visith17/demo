"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Constants
const APP_CONFIG = {
  QUERY_PARAMS: {
    SEARCH_OPEN: 'isSearchOpen',
    VIEW_MODE: 'viewMode',
  },
  STORAGE_KEYS: {
    THEME: 'app-theme',
    VIEW_MODE: 'app-view-mode',
    PREFERENCES: 'app-preferences',
  },
  DEFAULT_STATE: {
    isSearchOpen: false,
    isMobileMenuOpen: false,
    isLoading: false,
    theme: 'light' as Theme,
    viewMode: 'grid' as ViewMode,
    preferences: {
      animations: true,
      reducedMotion: false,
      fontSize: 'medium' as FontSize,
      language: 'en' as Language,
    },
  },
  BREAKPOINTS: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },
} as const;

// Types
type Theme = 'light' | 'dark' | 'system';
type ViewMode = 'grid' | 'list';
type FontSize = 'small' | 'medium' | 'large';
type Language = 'en' | 'es' | 'fr' | 'de' | 'ja';

interface UserPreferences {
  animations: boolean;
  reducedMotion: boolean;
  fontSize: FontSize;
  language: Language;
}

interface AppState {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isLoading: boolean;
  theme: Theme;
  viewMode: ViewMode;
  preferences: UserPreferences;
}

interface AppContextValue extends AppState {
  // UI Controls
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  closeAll: () => void;
  setLoading: (isLoading: boolean) => void;
  
  // Theme and View Controls
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  
  // Preference Management
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  
  // Utility Functions
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Create a type-safe context with default value
 */
const AppContext = createContext<AppContextValue>({
  ...APP_CONFIG.DEFAULT_STATE,
  toggleSearch: () => {},
  toggleMobileMenu: () => {},
  closeAll: () => {},
  setLoading: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
  setViewMode: () => {},
  toggleViewMode: () => {},
  updatePreferences: () => {},
  resetPreferences: () => {},
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

// Add display name for better debugging
AppContext.displayName = "AppContext";

/**
 * Hook to sync URL search params with state
 */
function useSyncUrlParam(key: string, value: boolean | string): (newValue: boolean | string) => void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback((newValue: boolean | string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newValue) {
      params.set(key, newValue.toString());
    } else {
      params.delete(key);
    }

    // Only update URL if the value actually changed
    const current = params.get(key);
    if (current !== newValue.toString()) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [key, pathname, router, searchParams]);
}

/**
 * Hook to manage theme preference with system theme detection
 */
function useThemePreference(): [Theme, (theme: Theme) => void, () => void] {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME) as Theme) || 'light';
  });

  // System theme detection
  const systemThemeQuery = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    systemThemeQuery.current = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
        document.documentElement.classList.toggle('light', !e.matches);
      }
    };

    // Apply initial theme class
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');

    systemThemeQuery.current.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      systemThemeQuery.current?.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, theme);

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = systemThemeQuery.current?.matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  return [theme, setThemeState, toggleTheme];
}

/**
 * Hook to manage responsive breakpoints
 */
function useBreakpoints() {
  const [breakpoints, setBreakpoints] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isMobile: width < APP_CONFIG.BREAKPOINTS.mobile,
        isTablet: width >= APP_CONFIG.BREAKPOINTS.mobile && width < APP_CONFIG.BREAKPOINTS.desktop,
        isDesktop: width >= APP_CONFIG.BREAKPOINTS.desktop,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints;
}

interface AppProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
}

/**
 * AppProvider component for managing global application state
 */
export function AppProvider({ children, initialState = {} }: AppProviderProps) {
  // Initialize state with defaults and any provided initial values
  const [state, setState] = useState<AppState>(() => {
    const savedPreferences = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PREFERENCES) || '{}')
      : {};

    return {
      ...APP_CONFIG.DEFAULT_STATE,
      ...initialState,
      preferences: {
        ...APP_CONFIG.DEFAULT_STATE.preferences,
        ...savedPreferences,
      },
    };
  });

  // Theme management
  const [theme, setTheme, toggleTheme] = useThemePreference();

  // Responsive breakpoints
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  // URL synchronization
  const syncSearchParam = useSyncUrlParam(APP_CONFIG.QUERY_PARAMS.SEARCH_OPEN, state.isSearchOpen);
  const syncViewMode = useSyncUrlParam(APP_CONFIG.QUERY_PARAMS.VIEW_MODE, state.viewMode);

  // State update handlers
  const toggleSearch = useCallback(() => {
    setState(prev => {
      const newValue = !prev.isSearchOpen;
      syncSearchParam(newValue);
      return { ...prev, isSearchOpen: newValue };
    });
  }, [syncSearchParam]);

  const toggleMobileMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMobileMenuOpen: !prev.isMobileMenuOpen
    }));
  }, []);

  const closeAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSearchOpen: false,
      isMobileMenuOpen: false
    }));
    syncSearchParam(false);
  }, [syncSearchParam]);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode }));
    syncViewMode(viewMode);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [syncViewMode]);

  const toggleViewMode = useCallback(() => {
    setViewMode(state.viewMode === 'grid' ? 'list' : 'grid');
  }, [state.viewMode, setViewMode]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setState(prev => {
      const newPreferences = { ...prev.preferences, ...updates };
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PREFERENCES, JSON.stringify(newPreferences));
      return { ...prev, preferences: newPreferences };
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferences: APP_CONFIG.DEFAULT_STATE.preferences
    }));
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.PREFERENCES);
  }, []);

  // Initialize from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const searchOpen = params.get(APP_CONFIG.QUERY_PARAMS.SEARCH_OPEN) === 'true';
    const viewMode = params.get(APP_CONFIG.QUERY_PARAMS.VIEW_MODE) as ViewMode;
    
    setState(prev => ({
      ...prev,
      isSearchOpen: searchOpen,
      viewMode: viewMode || prev.viewMode,
    }));
  }, []);

  // Handle reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreference = (e: MediaQueryListEvent) => {
      updatePreferences({ reducedMotion: e.matches });
    };

    mediaQuery.addEventListener('change', handleMotionPreference);
    return () => mediaQuery.removeEventListener('change', handleMotionPreference);
  }, [updatePreferences]);

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({
      ...state,
      theme,
      toggleSearch,
      toggleMobileMenu,
      closeAll,
      setLoading,
      setTheme,
      toggleTheme,
      setViewMode,
      toggleViewMode,
      updatePreferences,
      resetPreferences,
      isMobile,
      isTablet,
      isDesktop,
    }),
    [
      state,
      theme,
      toggleSearch,
      toggleMobileMenu,
      closeAll,
      setLoading,
      setTheme,
      toggleTheme,
      setViewMode,
      toggleViewMode,
      updatePreferences,
      resetPreferences,
      isMobile,
      isTablet,
      isDesktop,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to access app context
 * @throws Error if used outside AppProvider
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}

// Export the provider as default
export default AppProvider;
