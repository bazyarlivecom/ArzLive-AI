import React, { useState, useEffect } from 'react';
import { Asset, AssetType } from './types';
import { fetchMarketData } from './services/dataService';
import { AssetCard } from './components/AssetCard';
import { MarketAnalysis } from './components/MarketAnalysis';

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currencyMode, setCurrencyMode] = useState<'TOMAN' | 'RIAL'>('TOMAN');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Initial Load & Polling
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchMarketData();
      setAssets(data);
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
    // 24 hours * 60 minutes = 1440 minutes
    // Setting interval to 60,000ms (1 minute) results in 1440 requests per day, which is safe.
    const interval = setInterval(() => {
      loadData();
    }, 60000); 

    return () => clearInterval(interval);
  }, []);

  const currencies = assets.filter(a => a.type === AssetType.CURRENCY);
  const gold = assets.filter(a => a.type === AssetType.GOLD);
  const crypto = assets.filter(a => a.type === AssetType.CRYPTO);

  return (
    <div className="min-h-screen bg-[#0f172a] pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            
            {/* Logo and Title */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-xl font-bold text-slate-100">ارز لایو <span className="text-blue-400">هوشمند</span></h1>
              </div>

              {/* Mobile Currency Toggle (Visible only on small screens) */}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Market Analysis AI Section */}
        <section>
          <MarketAnalysis assets={assets} />
        </section>

        {/* Currencies Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <span className="text-2xl">💵</span>
             <h2 className="text-xl font-bold text-white">ارزهای رایج</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currencies.map(asset => (
              <AssetCard key={asset.id} asset={asset} currencyMode={currencyMode} />
            ))}
          </div>
        </section>

        {/* Gold Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <span className="text-2xl">🏆</span>
             <h2 className="text-xl font-bold text-white">طلا و سکه</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gold.map(asset => (
              <AssetCard key={asset.id} asset={asset} currencyMode={currencyMode} />
            ))}
          </div>
        </section>

        {/* Crypto Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <span className="text-2xl">₿</span>
             <h2 className="text-xl font-bold text-white">رمزارزها</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crypto.map(asset => (
              <AssetCard key={asset.id} asset={asset} currencyMode={currencyMode} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default App;