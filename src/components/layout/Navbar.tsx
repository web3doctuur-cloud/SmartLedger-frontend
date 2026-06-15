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
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: HomeIcon, showWhen: true },
    { href: '/products', label: 'Products', icon: CubeIcon, showWhen: isAuthenticated },
    { href: '/tasks', label: 'Tasks', icon: CheckCircleIcon, showWhen: isAuthenticated },
    { href: '/reports', label: 'Reports', icon: DocumentTextIcon, showWhen: isAuthenticated },
    { href: '/analytics', label: 'Analytics', icon: ChartBarIcon, showWhen: isAdmin },
  ];

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-yellow-500">Smart</span>
              <span className="text-2xl font-bold text-white">Ledger</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.showWhen && (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-300 hover:bg-yellow-500 hover:text-black'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            ))}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium bg-yellow-500 text-black hover:bg-yellow-400 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              link.showWhen && (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-300 hover:bg-yellow-500 hover:text-black'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            ))}
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium bg-yellow-500 text-black hover:bg-yellow-400"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;