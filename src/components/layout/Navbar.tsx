'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  CubeIcon, 
  CheckCircleIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingLibraryIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: HomeIcon, showWhen: true },
    { href: '/products', label: 'Products', icon: CubeIcon, showWhen: isAuthenticated },
    { href: '/tasks', label: 'Tasks', icon: CheckCircleIcon, showWhen: isAuthenticated },
    { href: '/accounts', label: 'Accounts', icon: BuildingLibraryIcon, showWhen: isAuthenticated },
    { href: '/journal', label: 'Journal', icon: BookOpenIcon, showWhen: isAuthenticated },
    { href: '/reports', label: 'Reports', icon: DocumentTextIcon, showWhen: isAuthenticated },
    { href: '/analytics', label: 'Analytics', icon: ChartBarIcon, showWhen: isAuthenticated },
  ];

  return (
    <nav className="bg-black text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="h-10 w-10 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <span className="text-xl font-bold text-black">SL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  <span className="text-yellow-500">Smart</span>
                  <span className="text-white">Ledger</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              link.showWhen && (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-yellow-500 text-black shadow-md'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            ))}
            <div className="ml-4 flex items-center space-x-2">
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              {isOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 shadow-2xl">
          <div className="px-3 pt-3 pb-4 space-y-1.5">
            {navLinks.map((link) => (
              link.showWhen && (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <link.icon className="h-6 w-6" />
                  <span>{link.label}</span>
                </Link>
              )
            ))}
            <div className="pt-2 space-y-1.5">
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-base font-semibold bg-red-600 hover:bg-red-700 transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 transition-all duration-200"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
