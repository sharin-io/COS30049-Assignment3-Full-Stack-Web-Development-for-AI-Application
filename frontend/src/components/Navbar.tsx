import React from 'react';
import { Cloud, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  darkMode,
  toggleDarkMode,
}) => {
  const pages = ['Home', 'Map', 'Data', 'Education', 'About', 'Test'];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Cloud className="h-8 w-8" style={{ color: '#2196F3' }} />
            <span className="text-[#212121] dark:text-white transition-colors">AirAware</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activePage === page
                    ? 'bg-[#2196F3] text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>



      {/* Mobile Menu */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-2 py-2 rounded-lg transition-all ${
                activePage === page
                  ? 'bg-[#2196F3] text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
