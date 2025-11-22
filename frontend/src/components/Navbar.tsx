import React from 'react';
import { Cloud, Moon, Sun, Menu } from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

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
  const pages = ['Home', 'Map', 'Data Visualization', 'Education', 'About', 'Test'];
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handlePageClick = (page: string) => {
    setActivePage(page);
    setMobileMenuOpen(false); // Close mobile menu when page is selected
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Cloud className="h-8 w-8" style={{ color: '#2196F3' }} />
            <span className="text-[#212121] dark:text-white transition-colors font-semibold">AirAware</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activePage === page
                    ? 'bg-[#2196F3] text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Right Side - Dark Mode Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-lg"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Cloud className="h-6 w-6" style={{ color: '#2196F3' }} />
                    <span>AirAware</span>
                  </SheetTitle>
                </SheetHeader>
                
                {/* Mobile Navigation Menu */}
                <nav className="mt-8 flex flex-col gap-2">
                  {pages.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        activePage === page
                          ? 'bg-[#2196F3] text-white shadow-md font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>{page}</span>
                      {activePage === page && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </button>
                  ))}
                </nav>

                {/* Mobile Dark Mode Toggle in Menu */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      toggleDarkMode();
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
