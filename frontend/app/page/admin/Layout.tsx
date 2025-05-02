'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Properties', href: '/admin/properties' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Approvals', href: '/admin/approvals' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`flex flex-col ${collapsed ? 'w-20' : 'w-64'} transition-all bg-gray-800 p-4`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-6 text-white focus:outline-none"
        >
          {collapsed ? '➡️' : '⬅️'}
        </button>

        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`p-2 rounded hover:bg-gray-700 ${
                pathname === link.href ? 'bg-gray-700' : ''
              }`}
            >
              {collapsed ? link.name.charAt(0) : link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}
