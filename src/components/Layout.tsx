import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  PackageSearch, 
  PenTool, 
  CheckCircle2,
  MessageSquare, 
  Image as ImageSearch, 
  MapPin, 
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

import { checkFeatureAccess, Tier } from '../services/tierService';

export default function Layout() {
  const { user, userData, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const allNavItems = [
    { name: 'Studio Hub', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/app/projects', icon: PenTool },
    { name: 'Memory Weaver', path: '/app/apps/memory', icon: BrainCircuit },
    { name: 'Inventory Weaver', path: '/app/apps/inventory', icon: PackageSearch, feature: 'hasInventoryWeaver' },
    { name: 'Design Studio', path: '/app/apps/studio', icon: Sparkles, feature: 'hasDesignStudio' },
    { name: 'QACS Placement', path: '/app/apps/placement', icon: PenTool, feature: 'hasDesignStudio' },
    { name: 'Motion Engine', path: '/app/apps/motion', icon: Sparkles, feature: 'hasDesignStudio' },
    { name: 'Creator Studio', path: '/app/apps/upload', icon: Sparkles, feature: 'hasCreatorUpload' },
    { name: 'Marketplace', path: '/app/marketplace', icon: ShoppingBag },
  ];

  const navItems = allNavItems.filter(item => {
    if (userData?.role === 'admin' || user?.email === 'thebadencompany@gmail.com') return true;
    
    // If the item has a feature requirement, check it against the user's tier
    if (item.feature) {
      const userTier = (userData?.tier || 'free') as Tier;
      return checkFeatureAccess(userTier, item.feature as any);
    }

    return true; 
  });

  return (
    <div className="flex h-screen bg-cream font-sans text-ink overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-0'
        } bg-white-studio border-r border-ink/5 flex flex-col transition-all duration-500 ease-in-out relative z-30`}
      >
        <div className="p-8 flex flex-col gap-12 h-full">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-serif text-xl font-medium tracking-tight hover:opacity-70 transition-opacity flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-70" transform="rotate(0,10,10)"/>
                <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-60" transform="rotate(72,10,10)"/>
                <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-70" transform="rotate(144,10,10)"/>
                <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-60" transform="rotate(216,10,10)"/>
                <ellipse cx="10" cy="4.5" rx="3.2" ry="5.5" fill="currentColor" className="text-sage opacity-70" transform="rotate(288,10,10)"/>
                <circle cx="10" cy="10" r="2.2" fill="currentColor" className="text-bark"/>
              </svg>
              Evercrafted <span className="salty-style text-sm ml-1">studio</span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-cream transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1">
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-studio/40 mb-6 block">Studio Navigation</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-0 py-3 text-[10px] uppercase tracking-[0.2em] transition-all group ${
                    isActive 
                      ? 'text-ink font-bold' 
                      : 'text-muted-studio/60 hover:text-ink'
                  }`}
                >
                  <div className={`w-1 h-1 rounded-full transition-all ${isActive ? 'bg-ink scale-150' : 'bg-transparent group-hover:bg-ink/20'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-8 border-t border-ink/5 space-y-8">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-10 h-10 grayscale rounded-none" />
              ) : (
                <div className="w-10 h-10 bg-sage-ll text-sage-d flex items-center justify-center text-[10px] font-bold">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest truncate text-ink">{user?.displayName}</p>
                <p className="text-[9px] text-muted-studio/60 truncate uppercase tracking-tighter">{user?.email}</p>
              </div>
            </div>
            <button 
              className="text-[10px] uppercase tracking-[0.2em] w-full text-left hover:opacity-50 transition-opacity flex items-center gap-2 text-muted-studio"
              onClick={logout}
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle Button for Mobile/Collapsed */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-8 left-8 z-40 p-3 bg-white-studio border border-ink/10 hover:bg-cream transition-all shadow-sm"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-cream">
        <div className="max-w-[1600px] mx-auto min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
