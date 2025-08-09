import { useState } from 'react';
import { Search, Phone, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-red-600 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">EmergencyWA</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700" href="#">
                Dashboard
              </a>
              <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700" href="#">
                Bushfire
              </a>
              <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700" href="#">
                Flood
              </a>
              <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700" href="#">
                Preparedness
              </a>
            </div>
          </nav>

          {/* Search and Emergency Contact */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10 w-64 bg-white text-gray-900"
                placeholder="Search regions..."
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
              />
            </div>

            {/* Emergency Contact */}
            <Button 
              className="bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 font-bold" 
              variant="outline"
            >
              <Phone className="mr-2 h-4 w-4" />
              Call 000
            </Button>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button className="md:hidden text-white hover:bg-red-700" size="icon" variant="ghost">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px]" side="right">
                <nav className="flex flex-col space-y-4 mt-4">
                  <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100" href="#">
                    Dashboard
                  </a>
                  <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100" href="#">
                    Bushfire
                  </a>
                  <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100" href="#">
                    Flood
                  </a>
                  <a className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100" href="#">
                    Preparedness
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}; 