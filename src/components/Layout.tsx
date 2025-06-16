
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, Database, Laptop, File, User, Calendar, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization';

const sidebarItems = [
  { icon: Building2, label: 'Organizações', href: '/organizations' },
  { icon: Database, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Pessoas', href: '/people' },
  { icon: User, label: 'Times', href: '/teams' },
  { icon: File, label: 'Licenças', href: '/licenses' },
  { icon: Laptop, label: 'Ativos', href: '/assets' },
  { icon: Calendar, label: 'Documentos', href: '/documents' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { currentOrganization, loading } = useCurrentOrganization();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-transform duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b border-gray-200 px-4">
            <div className="corporate-gradient rounded-lg p-2">
              <Database className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">CompanyHub</h1>
                <p className="text-sm text-gray-500">Gestão Empresarial</p>
              </div>
            )}
          </div>

          {/* Current Organization */}
          {currentOrganization && (
            <div className="border-b border-gray-200 px-4 py-3">
              {sidebarOpen ? (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Organização Atual</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{currentOrganization.name}</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="bg-blue-100 rounded-full p-1">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm transition-colors duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", sidebarOpen ? "mr-3" : "mx-auto")} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Toggle Button */}
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full"
            >
              {sidebarOpen ? '←' : '→'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        {/* Top Bar with Organization Info */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentOrganization && (
                <>
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Trabalhando em: <span className="font-medium text-gray-900">{currentOrganization.name}</span>
                  </span>
                </>
              )}
              {loading && (
                <span className="text-sm text-gray-500">Carregando organização...</span>
              )}
            </div>
          </div>
        </div>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
