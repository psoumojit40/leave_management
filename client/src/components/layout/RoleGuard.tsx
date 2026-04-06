'use client'; // FIX 1: Directive for hooks and router

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // FIX 2: Standard Next.js navigation
import Button from '@/components/ui/Button';

// FIX 3: Changed to NAMED export to match your layout.tsx import
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<'employee' | 'manager' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  
  const pathname = usePathname(); // Actual URL path (e.g., /dashboard, /leave)
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // Simulate API call to get role from your Express server or JWT
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For development, we'll set this to admin so you can see all pages
        setUserRole('admin'); 
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  // FIX 4: Mapping browser URLs (Next.js strips the (dashboard) parens from the URL)
  const routeAccessMap: Record<string, string[]> = {
    '/dashboard': ['employee', 'manager', 'admin'],
    '/leave': ['employee', 'manager', 'admin'],
    '/attendance': ['employee', 'manager', 'admin'],
    '/reports': ['employee', 'manager', 'admin'],
    '/approvals': ['manager', 'admin'],
    '/admin': ['admin'],
    '/payroll-export': ['admin'],
    '/users': ['admin'],
    '/audit-log': ['admin'],
  };

  const hasAccess = () => {
    if (loading) return true;

    // Check for exact matches or prefix matches (for dynamic routes like /leave/[id])
    const matchingKey = Object.keys(routeAccessMap).find(key => 
      pathname === key || pathname.startsWith(`${key}/`)
    );

    if (matchingKey) {
      const allowedRoles = routeAccessMap[matchingKey];
      return allowedRoles.includes(userRole as any);
    }
    
    // Default to true if the route isn't in our map (allows basic pages)
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4 text-gray-500 font-medium">Verifying Permissions...</p>
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white rounded-xl border border-dashed border-gray-200">
        <div className="text-center p-8 max-w-md">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-8">
            Your account ({userRole}) does not have the required permissions to view the <strong>{pathname}</strong> section.
          </p>
          <div className="flex flex-col space-y-3">
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
            <button 
              onClick={() => router.back()}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}