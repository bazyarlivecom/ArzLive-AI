import React, { useState, useEffect, useMemo } from 'react';
import { Asset, AssetType, SortOption } from './types';
import { fetchMarketData } from './services/dataService';
import { AssetCard } from './components/AssetCard';
import { MarketHighlights } from './components/MarketHighlights';
import { AssetModal } from './components/AssetModal';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currencyMode, setCurrencyMode] = useState<'TOMAN' | 'RIAL'>('TOMAN');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New features state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('DEFAULT');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'FAVORITES'>('ALL');

  // Load Favorites from LocalStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem('arzlive_favorites');
    if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(id)) {
        newFavs = favorites.filter(favId => favId !== id);
    } else {
        newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem('arzlive_favorites', JSON.stringify(newFavs));
  };

  // Initial Load & Polling
  useEffect(() => {
    const loadData = async () => {
      const { assets: data, error: fetchError } = await fetchMarketData();
      setAssets(data);
      if (fetchError) {
        setError(fetchError);
      } else {
        setError(null);
      }

      // Format: YYYY/MM/DD - HH:MM:SS
      const now = new Date();
      setLastUpdated(now.toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    loadData();

    // Limit updates to ~1500 per day
    const interval = setInterval(() => {
      loadData();
    }, 60000); 

    return () => clearInterval(interval);
  }, []);

  // Sync selected asset data when assets update
  useEffect(() => {
    if (selectedAsset) {
      const updated = assets.find(a => a.id === selectedAsset.id);
      if (updated) setSelectedAsset(updated);
    }
  }, [assets, selectedAsset]);

  // Filtering and Sorting Logic
  const processedAssets = useMemo(() => {
    let result = [...assets];

    // 1. Filter by Tab (Favorites)
    if (activeFilterTab === 'FAVORITES') {
        result = result.filter(a => favorites.includes(a.id));
    }

    // 2. Filter by Search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(a => 
            a.nameFa.includes(searchTerm) || 
            a.nameEn.toLowerCase().includes(term)
        );
    }

    // 3. Sorting
    result.sort((a, b) => {
        switch (sortOption) {
            case 'PRICE_ASC': return a.priceToman - b.priceToman;
            case 'PRICE_DESC': return b.priceToman - a.priceToman;
            case 'CHANGE_ASC': return a.change24h - b.change24h;
            case 'CHANGE_DESC': return b.change24h - a.change24h;
            default: return 0; // Keep original order
        }
    });

    return result;
  }, [assets, activeFilterTab, searchTerm, sortOption, favorites]);

  // Grouping for display
  const currencies = processedAssets.filter(a => a.type === AssetType.CURRENCY);
  const gold = processedAssets.filter(a => a.type === AssetType.GOLD);
  const crypto = processedAssets.filter(a => a.type === AssetType.CRYPTO);

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20 font-sans text-slate-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            
            {/* Logo and Title */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-xl font-bold text-slate-100">ارز لایو <span className="text-blue-400 text-sm font-normal bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">PRO</span></h1>
              </div>

              {/* Mobile Currency Toggle */}
              <div className="md:hidden flex bg-slate-800 p-1 rounded-lg border border-slate-700 ml-2">
                <button 
                  onClick={() => setCurrencyMode('TOMAN')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    currencyMode === 'TOMAN' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  تومان
                </button>
                <button 
                  onClick={() => setCurrencyMode('RIAL')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    currencyMode === 'RIAL' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400'
                  }`}
                >
                  ریال
                </button>
              </div>
            </div>

            {/* Desktop Center/Right Controls */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
               
               {/* Last Updated Display */}
               <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 w-full md:w-auto justify-center">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>بروزرسانی: <span className="text-slate-200 font-mono font-bold mx-1">{lastUpdated}</span></span>
               </div>

              {/* Desktop Currency Toggle */}
              <div className="hidden md:flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button 
                  onClick={() => setCurrencyMode('TOMAN')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    currencyMode === 'TOMAN' 
                      ? 'bg-slate-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  تومان
                </button>
                <button 
                  onClick={() => setCurrencyMode('RIAL')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    currencyMode === 'RIAL' 
                      ? 'bg-slate-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ریال
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Market Highlights Section (Replaces AI) */}
        <section>
          <MarketHighlights assets={assets} currencyMode={currencyMode} />
        </section>

        {/* Toolbar: Search, Sort, Filter */}
        <section className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-30 shadow-xl">
            {/* Filter Tabs */}
            <div className="flex bg-slate-900/50 p-1 rounded-xl w-full md:w-auto">
                <button 
                    onClick={() => setActiveFilterTab('ALL')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeFilterTab === 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                    همه ارزها
                </button>
                <button 
                    onClick={() => setActiveFilterTab('FAVORITES')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeFilterTab === 'FAVORITES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    نشان‌شده‌ها
                </button>
            </div>

            {/* Search & Sort Group */}
            <div className="flex gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-64">
                    <input 
                        type="text" 
                        placeholder="جستجو (مانند: دلار، USD)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Sort */}
                <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
                    dir="rtl"
                >
                    <option value="DEFAULT">مرتب‌سازی پیش‌فرض</option>
                    <option value="PRICE_DESC">گران‌ترین</option>
                    <option value="PRICE_ASC">ارزان‌ترین</option>
                    <option value="CHANGE_DESC">بیشترین رشد</option>
                    <option value="CHANGE_ASC">بیشترین افت</option>
                </select>
            </div>
        </section>

        {processedAssets.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                <span className="text-4xl block mb-4">🔍</span>
                <p className="text-slate-400 text-lg">موردی یافت نشد.</p>
                <button onClick={() => {setSearchTerm(''); setActiveFilterTab('ALL');}} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
                    پاک کردن فیلترها
                </button>
            </div>
        ) : (
            <>
                {/* Currencies Section */}
                {currencies.length > 0 && (
                    <section className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                    <div className="flex items-center gap-2 mb-4 border-r-4 border-green-500 pr-3">
                        <h2 className="text-xl font-bold text-white">ارزهای رایج</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currencies.map(asset => (
                        <AssetCard 
                            key={asset.id} 
                            asset={asset} 
                            currencyMode={currencyMode}
                            isFavorite={favorites.includes(asset.id)}
                            onToggleFavorite={toggleFavorite}
                            onClick={setSelectedAsset}
                        />
                        ))}
                    </div>
                    </section>
                )}

                {/* Gold Section */}
                {gold.length > 0 && (
                    <section className="animate-slide-up" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center gap-2 mb-4 border-r-4 border-yellow-500 pr-3">
                        <h2 className="text-xl font-bold text-white">طلا و سکه</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gold.map(asset => (
                        <AssetCard 
                            key={asset.id} 
                            asset={asset} 
                            currencyMode={currencyMode} 
                            isFavorite={favorites.includes(asset.id)}
                            onToggleFavorite={toggleFavorite}
                            onClick={setSelectedAsset}
                        />
                        ))}
                    </div>
                    </section>
                )}

                {/* Crypto Section */}
                {crypto.length > 0 && (
                    <section className="animate-slide-up" style={{animationDelay: '0.3s'}}>
                    <div className="flex items-center gap-2 mb-4 border-r-4 border-indigo-500 pr-3">
                        <h2 className="text-xl font-bold text-white">رمزارزها</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {crypto.map(asset => (
                        <AssetCard 
                            key={asset.id} 
                            asset={asset} 
                            currencyMode={currencyMode} 
                            isFavorite={favorites.includes(asset.id)}
                            onToggleFavorite={toggleFavorite}
                            onClick={setSelectedAsset}
                        />
                        ))}
                    </div>
                    </section>
                )}
            </>
        )}

      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-4 z-50 bg-red-900/90 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-3 border border-red-500/50 animate-bounce transition-all duration-300">
          <div className="bg-red-500/20 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm">خطای شبکه</p>
            <p className="text-xs text-red-200">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="mr-2 hover:bg-white/10 rounded-full p-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Asset Modal Details */}
      {selectedAsset && (
        <AssetModal 
          asset={selectedAsset} 
          currencyMode={currencyMode}
          onClose={() => setSelectedAsset(null)} 
        />
      )}

    </div>
  );
};

export default App;