/**
 * Header Component
 * Application header with logo, search, and theme toggle
 */

import { useUIStore } from '@/store/uiStore';
import SearchBar from '@/components/search/SearchBar';
import { useMovieSearch } from '@/hooks/useMovieSearch';

export interface HeaderProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Header component with branding, search, and theme toggle
 */
export default function Header({ className = '' }: HeaderProps) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const { searchTerm, setSearchTerm, clearSearch, isSearching, resultCount } = useMovieSearch();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-apple-bg-primary/80 backdrop-blur-lg border-b border-apple-divider ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* Top Row: Logo and Theme Toggle */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/assets/redhat-quay-logo.png" alt="Red Hat Quay" className="h-8" />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-apple-bg-secondary transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className="text-2xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>

        {/* Bottom Row: Search Bar */}
        <div className="pb-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={clearSearch}
            isLoading={isSearching}
            resultCount={searchTerm ? resultCount : undefined}
          />
        </div>
      </div>
    </header>
  );
}
