import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { RoleGuard } from '@/components/layout/RoleGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* 1. Sidebar - Fixed height, handles its own expansion width */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* 2. Navbar - Stays pinned at the top */}
        <Navbar />
        
        {/* 3. Main Content Area - Independent scroll */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#FBFBFE] custom-scrollbar">
          <RoleGuard>
            {/* Added a container to keep content centered and readable */}
            <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
              {children}
            </div>
          </RoleGuard>
        </main>
      </div>
    </div>
  );
}