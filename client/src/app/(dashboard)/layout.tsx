import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. Sidebar - Fixed width on desktop, hidden or toggleable on mobile */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Navbar - Stays at the top */}
        <Navbar />
        
        {/* 3. Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <RoleGuard>
            {children}
          </RoleGuard>
        </main>
      </div>
    </div>
  );
}