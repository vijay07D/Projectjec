import React, { useState } from 'react';
import {
  Droplets,
  Globe,
  User,
  Wifi,
  WifiOff,
  Menu,
  X,
  LayoutDashboard,
  Calculator,
  Layers,
  ChevronRight,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useWaterStore, CityFilter } from '../store/useWaterStore';
import { translations } from '../translations';
import { PageId } from '../types';

export const Header: React.FC = () => {
  const {
    language,
    toggleLanguage,
    isOffline,
    toggleOffline,
    lastUpdatedMinutesAgo,
    setActiveModal,
    currentPage,
    setCurrentPage,
    cityFilter,
    setCityFilter,
  } = useWaterStore();
  const t = translations[language];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tab bar matching: [Dashboard] [Find Supply] [DOCK] [Map] [Allocation Grid]
  const navItems: {
    id: PageId;
    label: string;
    label_hi: string;
    icon: React.ReactNode;
    badge?: string;
    desc: string;
    desc_hi: string;
  }[] = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      label_hi: 'डैशबोर्ड',
      icon: <LayoutDashboard className="w-4 h-4" />,
      desc: 'Operations overview, key metrics & live alerts',
      desc_hi: 'संचालन अवलोकन, प्रमुख मेट्रिक्स और लाइव अलर्ट',
    },
    {
      id: 'find-supply',
      label: t.navFindSupply,
      label_hi: 'सप्लाई खोजें',
      icon: <Layers className="w-4 h-4" />,
      badge: 'Sources',
      desc: 'Ponds, dams, lakes, RO plants & municipal works',
      desc_hi: 'तालाब, बांध, झीलें, आरओ संयंत्र और जल आपूर्ति स्रोत',
    },
    {
      id: 'dock',
      label: t.navDock,
      label_hi: 'DOCK',
      icon: <Calculator className="w-4 h-4" />,
      badge: 'Demand',
      desc: 'Domestic + Commercial demand calculator (10 columns, c multiplier)',
      desc_hi: 'घरेलू + वाणिज्यिक मांग कैलकुलेटर (10 कॉलम, गुणक c)',
    },
    {
      id: 'map',
      label: t.navMap,
      label_hi: 'मानचित्र',
      icon: <MapPin className="w-4 h-4" />,
      desc: 'Hydraulic distribution heatmap and GIS layer controls',
      desc_hi: 'हाइड्रोलिक वितरण हीटमैप और जीआईएस लेयर्स',
    },
    {
      id: 'allocation-grid',
      label: t.navAllocationGrid,
      label_hi: 'आवंटन तालिका',
      icon: <Droplets className="w-4 h-4" />,
      badge: '17 Zones',
      desc: 'Formula-driven supply calculation (Pop × LPC × Loss / 1000)',
      desc_hi: 'सूत्र आधारित आपूर्ति गणना (जनसंख्या × LPC × लॉस / 1000)',
    },
  ];

  const handleNavClick = (pageId: PageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-[#0A4D8C] text-white shadow-md sticky top-0 z-30">
        {/* TOP BRAND & CONTROLS ROW */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2 border-b border-blue-800/60">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle Button */}
              <button
                id="mobile-nav-hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#00B4D8] cursor-pointer"
                aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center gap-3 cursor-pointer group"
                title="DOCK — Domestic & Commercial Water Distribution Optimizer"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00B4D8] text-white flex items-center justify-center shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                      {t.appTitle}
                    </h1>
                    <span className="text-[11px] bg-[#00B4D8]/30 text-[#E0F7FA] border border-[#00B4D8]/50 px-2 py-0.5 rounded-full font-bold hidden xs:inline-block">
                      Domestic + Commercial
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 hidden sm:block">
                    {t.subTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Controls (Sync Status, Language Toggle, Officer Profile) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sync / Offline toggle pill */}
              <button
                onClick={toggleOffline}
                title={isOffline ? 'Simulating offline cached mode' : 'Live real-time feed active'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                  isOffline
                    ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50 hover:bg-emerald-500/30'
                }`}
                aria-label={isOffline ? t.offlineStatus : t.liveStatus}
              >
                {isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden md:inline">{t.offlineStatus}</span>
                    <span className="text-[11px] opacity-80">({lastUpdatedMinutesAgo}m)</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <Wifi className="w-3.5 h-3.5 text-emerald-300 hidden xs:inline" />
                    <span className="hidden md:inline">{t.liveStatus}</span>
                  </>
                )}
              </button>

              {/* Hindi / English Language Toggle Button */}
              <button
                id="language-toggle-btn"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/25 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B4D8] min-h-[38px] touch-manipulation cursor-pointer"
                aria-label="Switch Language"
              >
                <Globe className="w-4 h-4 text-[#00B4D8]" />
                <span className="font-medium text-white">{t.toggleLanguage}</span>
              </button>

              {/* Officer Profile Button */}
              <button
                id="officer-profile-btn"
                onClick={() => setActiveModal('profile')}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-md bg-[#073663] hover:bg-[#062c52] border border-blue-400/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B4D8] min-h-[38px] touch-manipulation cursor-pointer"
                title={t.officerRole}
                aria-label="Officer Profile"
              >
                <div className="w-7 h-7 rounded-full bg-blue-300 text-[#0A4D8C] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold leading-tight text-white">Er. V. Sharma</p>
                  <p className="text-[11px] text-blue-200 leading-tight">Operations Lead</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* TAB BAR (EXACT: [Dashboard] [Find Supply] [DOCK] [Map] [Allocation Grid]) */}
        <div className="hidden md:block bg-[#083e70] border-t border-blue-900/40 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <nav className="flex items-center space-x-1.5 py-1.5" aria-label="Main Navigation">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                const label = language === 'hi' ? item.label_hi : item.label;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#0A4D8C] shadow-sm font-extrabold'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-[#0A4D8C]' : 'text-blue-200'}>{item.icon}</span>
                    <span>{label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-blue-100 text-[#0A4D8C]' : 'bg-blue-900/80 text-blue-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Regional Indicator */}
            <div className="text-[11px] text-blue-200/90 font-medium hidden lg:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00B4D8] animate-pulse"></span>
              <span>Domestic + Commercial Distribution Grid Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-[#0A4D8C] text-white flex flex-col h-full shadow-2xl z-10 border-r border-blue-700 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-blue-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#00B4D8] text-white flex items-center justify-center shadow-inner">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg text-white leading-tight">{t.appTitle}</h2>
                  <p className="text-[11px] text-blue-200">Water Distribution Optimizer</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label={t.closeMenu}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider px-2 mb-1">
                {language === 'hi' ? 'नेविगेशन पेज' : 'Navigation Tabs'}
              </p>

              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                const label = language === 'hi' ? item.label_hi : item.label;
                const desc = language === 'hi' ? item.desc_hi : item.desc;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#0A4D8C] font-bold shadow-md'
                        : 'bg-white/5 hover:bg-white/15 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          isActive ? 'bg-blue-100 text-[#0A4D8C]' : 'bg-white/10 text-blue-200'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{label}</span>
                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                isActive ? 'bg-blue-100 text-[#0A4D8C]' : 'bg-blue-900 text-blue-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isActive ? 'text-slate-600' : 'text-blue-200/80'
                          }`}
                        >
                          {desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 mt-1 ${isActive ? 'text-[#0A4D8C]' : 'text-blue-300'}`} />
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-blue-800 bg-[#073663] space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-200">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#00B4D8]" />
                  <span>{t.toggleLanguage}</span>
                </button>
                <button
                  onClick={toggleOffline}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
                >
                  {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-300" /> : <Wifi className="w-3.5 h-3.5 text-emerald-300" />}
                  <span>{isOffline ? 'Offline' : 'Live Sync'}</span>
                </button>
              </div>

              <div
                onClick={() => {
                  setActiveModal('profile');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-300 text-[#0A4D8C] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white leading-tight">Er. V. Sharma</p>
                  <p className="text-[11px] text-blue-200 leading-tight">Operations Executive</p>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
