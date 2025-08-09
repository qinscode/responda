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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

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

  const navigationItems = [
    { label: 'Dashboard', href: '#', active: true, ariaLabel: 'Dashboard - Current page' },
    { label: 'Forecasts', href: '#', active: false, ariaLabel: 'Weather forecasts' },
    { label: 'Alerts', href: '#', active: false, badge: '3', ariaLabel: 'Emergency alerts - 3 active' },
    { label: 'Reports', href: '#', active: false, ariaLabel: 'Emergency reports' },
  ];

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      {/* Emergency Alert Banner */}
      <div 
        className="bg-gradient-to-r from-emergency-600 to-emergency-700 px-4 py-2 text-center text-white text-sm font-medium"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" aria-hidden="true" />
          <span>Emergency Dashboard Active - Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emergency-500 to-emergency-700 text-white shadow-lg"
              role="img"
              aria-label="WA Emergency Dashboard Logo"
            >
              <Shield className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold heading-modern text-gradient">
                WA Emergency
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Real-time monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className={`relative ${
                item.active 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted/50"
              }`}
              size="sm"
              aria-label={item.ariaLabel}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse-glow"
                  aria-label={`${item.badge} new alerts`}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-6">
          <div className={`relative flex-1 transition-all duration-300 ${
            isSearchFocused ? 'scale-105' : ''
          }`}>
            <label htmlFor="search-input" className="sr-only">
              Search regions and alerts
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="search-input"
              type="search"
              placeholder="Search regions, alerts..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={handleKeyDown}
              className={`pl-10 glass transition-all duration-300 ${
                isSearchFocused 
                  ? 'ring-2 ring-primary/20 shadow-lg' 
                  : 'border-border/50'
              }`}
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
              Search for emergency regions, alerts, and local government areas. Press Escape to clear.
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  onSearchChange?.('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
                aria-label="Clear search"
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
            variant="ghost"
            size="sm"
            className="relative hidden sm:flex btn-glass"
            aria-label="Notifications - 3 unread"
          >
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs animate-pulse-glow"
              aria-hidden="true"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex btn-glass"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex btn-glass"
            aria-label="Change language"
          >
            <Globe className="h-4 w-4" />
          </Button>

          {/* Emergency Call Button */}
          <Button
            onClick={handleEmergencyCall}
            className="btn-emergency shadow-emergency hover:shadow-lg transition-all duration-200"
            size="sm"
            aria-label="Call emergency services - 000"
          >
            <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Emergency</span>
            <span className="sm:hidden">000</span>
          </Button>

          {/* User Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex btn-glass"
            aria-label="User profile"
          >
            <User className="h-4 w-4" />
          </Button>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden btn-glass"
                aria-label="Open mobile menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 glass" id="mobile-menu">
              <div className="flex flex-col gap-6 pt-6">
                {/* Mobile Search */}
                <div className="md:hidden">
                  <label htmlFor="mobile-search-input" className="sr-only">
                    Search regions and alerts
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="mobile-search-input"
                      type="search"
                      placeholder="Search regions, alerts..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      className="pl-10 glass"
                    />
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav role="navigation" aria-label="Mobile navigation">
                  <div className="flex flex-col gap-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.label}
                        variant={item.active ? "default" : "ghost"}
                        className={`justify-start relative ${
                          item.active 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label={item.ariaLabel}
                        aria-current={item.active ? "page" : undefined}
                      >
                        {item.label}
                        {item.badge && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto h-5 w-5 p-0 text-xs"
                            aria-label={`${item.badge} new`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </nav>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                  <Button variant="ghost" className="justify-start" aria-label="Notifications - 3 unread">
                    <Bell className="h-4 w-4 mr-3" />
                    Notifications
                    <Badge variant="destructive" className="ml-auto" aria-hidden="true">3</Badge>
                  </Button>
                  <Button variant="ghost" className="justify-start" aria-label="Settings">
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Button>
                  <Button variant="ghost" className="justify-start" aria-label="Change language">
                    <Globe className="h-4 w-4 mr-3" />
                    Language
                  </Button>
                  <Button variant="ghost" className="justify-start" aria-label="User profile">
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