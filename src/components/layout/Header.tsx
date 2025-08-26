import { useState } from 'react';
import { 
  Search, 
  Phone, 
  Menu, 
  Shield, 
  Bell, 
  Settings,
  Globe,
  User,
  X,
  BarChart3,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
}

export const Header = ({ onSearchChange }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleEmergencyCall = (): void => {
    window.open('tel:000', '_self');
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape') {
      setSearchQuery('');
      onSearchChange?.('');
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      {/* Emergency Alert Banner */}
      <div 
        aria-live="polite"
        className="bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-center text-white text-sm font-medium"
        role="alert"
      >
        <div className="flex items-center justify-center gap-2">
          <Shield aria-hidden="true" className="h-4 w-4" />
          <span>Emergency Dashboard Active - Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div 
              aria-label="WA Emergency Dashboard Logo"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg"
              role="img"
            >
              <Shield aria-hidden="true" className="h-6 w-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">
                WA Emergency
              </h1>
              <p className="text-xs text-gray-600 -mt-1">
                Real-time monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation - Desktop */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1" role="navigation">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            activeProps={{ 
              className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg" 
            }}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link 
            to="/analytics" 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            activeProps={{ 
              className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg" 
            }}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-6">
          <div className={`relative flex-1 transition-all duration-300 ${
            isSearchFocused ? 'scale-105' : ''
          }`}>
            <label className="sr-only" htmlFor="search-input">
              Search regions and alerts
            </label>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              aria-describedby="search-help"
              id="search-input"
              placeholder="Search regions, alerts..."
              type="search"
              value={searchQuery}
              className={`pl-10 bg-white/80 backdrop-blur border-gray-200 transition-all duration-300 ${
                isSearchFocused 
                  ? 'ring-2 ring-blue-500/20 shadow-lg border-blue-300' 
                  : 'border-gray-200'
              }`}
              onBlur={() => { setIsSearchFocused(false); }}
              onChange={handleSearchChange}
              onFocus={() => { setIsSearchFocused(true); }}
              onKeyDown={handleKeyDown}
            />
            <div className="sr-only" id="search-help">
              Search for emergency regions, alerts, and local government areas. Press Escape to clear.
            </div>
            {searchQuery && (
              <Button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  onSearchChange?.('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            aria-label="Notifications - 3 unread"
            className="relative hidden sm:flex bg-white/80 backdrop-blur border-gray-200 hover:bg-gray-50"
            size="sm"
            variant="outline"
          >
            <Bell className="h-4 w-4" />
            <Badge 
              aria-hidden="true" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500"
              variant="destructive"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button
            aria-label="Settings"
            className="hidden sm:flex bg-white/80 backdrop-blur border-gray-200 hover:bg-gray-50"
            size="sm"
            variant="outline"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Language Toggle */}
          <Button
            aria-label="Change language"
            className="hidden sm:flex bg-white/80 backdrop-blur border-gray-200 hover:bg-gray-50"
            size="sm"
            variant="outline"
          >
            <Globe className="h-4 w-4" />
          </Button>

          {/* Emergency Call Button */}
          <Button
            aria-label="Call emergency services - 000"
            className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="sm"
            onClick={handleEmergencyCall}
          >
            <Phone aria-hidden="true" className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Emergency</span>
            <span className="sm:hidden">000</span>
          </Button>

          {/* User Profile */}
          <Button
            aria-label="User profile"
            className="hidden sm:flex bg-white/80 backdrop-blur border-gray-200 hover:bg-gray-50"
            size="sm"
            variant="outline"
          >
            <User className="h-4 w-4" />
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                aria-label="Open mobile menu"
                className="lg:hidden bg-white/80 backdrop-blur border-gray-200 hover:bg-gray-50"
                size="sm"
                variant="outline"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80 bg-white/95 backdrop-blur" id="mobile-menu" side="right">
              <div className="flex flex-col gap-6 pt-6">
                {/* Mobile Search */}
                <div className="md:hidden">
                  <label className="sr-only" htmlFor="mobile-search-input">
                    Search regions and alerts
                  </label>
                  <div className="relative">
                    <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-10 bg-white border-gray-200"
                      id="mobile-search-input"
                      placeholder="Search regions, alerts..."
                      type="search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav aria-label="Mobile navigation" role="navigation">
                  <div className="flex flex-col gap-2">
                    <Link 
                      to="/" 
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      activeProps={{ 
                        className: "flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg" 
                      }}
                      onClick={() => { setMobileMenuOpen(false); }}
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/analytics" 
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      activeProps={{ 
                        className: "flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg" 
                      }}
                      onClick={() => { setMobileMenuOpen(false); }}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Link>
                  </div>
                </nav>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                  <Button aria-label="Notifications - 3 unread" className="justify-start hover:bg-gray-100" variant="ghost">
                    <Bell className="h-4 w-4 mr-3" />
                    Notifications
                    <Badge aria-hidden="true" className="ml-auto bg-red-500" variant="destructive">3</Badge>
                  </Button>
                  <Button aria-label="Settings" className="justify-start hover:bg-gray-100" variant="ghost">
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Button>
                  <Button aria-label="Change language" className="justify-start hover:bg-gray-100" variant="ghost">
                    <Globe className="h-4 w-4 mr-3" />
                    Language
                  </Button>
                  <Button aria-label="User profile" className="justify-start hover:bg-gray-100" variant="ghost">
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}; 