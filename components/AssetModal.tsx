import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Asset, Timeframe } from '../types';

interface AssetModalProps {
  asset: Asset;
  currencyMode: 'TOMAN' | 'RIAL';
  onClose: () => void;
}

type TabType = 'CHART' | 'DETAILS' | 'HISTORY' | 'CALCULATOR';

export const AssetModal: React.FC<AssetModalProps> = ({ asset, currencyMode, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('CHART');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  
  // Calculator State
  const [calcAmount, setCalcAmount] = useState<string>('1');
  const [calcResult, setCalcResult] = useState<string>('');

  const currencyLabel = currencyMode === 'TOMAN' ? 'تومان' : 'ریال';
  const multiplier = currencyMode === 'TOMAN' ? 1 : 10;
  const isPositive = asset.change24h >= 0;

  // Format Helpers
  const formatPrice = (p: number) => new Intl.NumberFormat('fa-IR').format(Math.floor(p * multiplier));
  const formatChange = (c: number) => new Intl.NumberFormat('fa-IR', { signDisplay: 'always' }).format(c);

  // Initialize calculator result on mount or asset change
  useEffect(() => {
    const numericAmount = parseFloat(calcAmount.replace(/,/g, '')) || 0;
    const result = numericAmount * asset.priceToman * multiplier;
    setCalcResult(new Intl.NumberFormat('fa-IR').format(Math.floor(result)));
  }, [asset.priceToman, multiplier, calcAmount]);

  const handleCalcAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and dots
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setCalcAmount(val);
  };

  // Chart Data Logic
  const chartData = useMemo(() => {
    const now = Date.now();
    let cutoff = 0;
    switch (timeframe) {
      case '1D': cutoff = now - (24 * 60 * 60 * 1000); break;
      case '1W': cutoff = now - (7 * 24 * 60 * 60 * 1000); break;
      case '1M': cutoff = now - (30 * 24 * 60 * 60 * 1000); break;
    }
    return asset.history
      .filter(h => h.timestamp >= cutoff)
      .map(pt => ({
        ...pt,
        price: pt.price * multiplier,
        displayTime: new Date(pt.timestamp).toLocaleTimeString('fa-IR', { 
            hour: '2-digit', minute: '2-digit', 
            month: timeframe !== '1D' ? 'numeric' : undefined,
            day: timeframe !== '1D' ? 'numeric' : undefined
        })
      }));
  }, [asset.history, timeframe, multiplier]);

  // Derived Stats
  const prices = chartData.map(d => d.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? prices.reduce((a,b) => a+b, 0) / prices.length : 0;

  // Calculate position percentage for the range bar
  const currentPriceDisplay = asset.priceToman * multiplier;
  let rangePercent = 50;
  if (maxPrice !== minPrice) {
    rangePercent = ((currentPriceDisplay - minPrice) / (maxPrice - minPrice)) * 100;
    rangePercent = Math.max(0, Math.min(100, rangePercent)); // Clamp between 0 and 100
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-secondary w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
               {asset.nameEn.substring(0, 1)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{asset.nameFa}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{asset.nameEn}</span>
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                <span>{asset.shamsiTime} - {asset.shamsiDate}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="px-6 py-4 bg-slate-800/30 flex flex-wrap justify-between items-end gap-4">
            <div>
                <span className="text-slate-400 text-sm mb-1 block">قیمت فعلی ({currencyLabel})</span>
                <span className="text-3xl font-bold text-white tracking-tight">{formatPrice(asset.priceToman)}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`} dir="ltr">
                    {formatChange(asset.change24h)}%
                </span>
                <span className={`text-sm ${isPositive ? 'text-green-500/70' : 'text-red-500/70'}`}>
                    {formatPrice(Math.abs(asset.changeAmount))} {isPositive ? '+' : '-'}
                </span>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50 px-6 mt-2 overflow-x-auto no-scrollbar gap-2">
          {(['CHART', 'DETAILS', 'CALCULATOR', 'HISTORY'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-indigo-500 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              {tab === 'CHART' && 'نمودار قیمت'}
              {tab === 'DETAILS' && 'جزئیات بازار'}
              {tab === 'CALCULATOR' && 'تبدیل نرخ'}
              {tab === 'HISTORY' && 'تاریخچه'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Chart Tab */}
          {activeTab === 'CHART' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-end gap-2 mb-4">
                {(['1D', '1W', '1M'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      timeframe === tf ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf === '1D' ? '24 ساعت' : tf === '1W' ? 'هفتگی' : 'ماهانه'}
                  </button>
                ))}
              </div>
              <div className="h-64 w-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="displayTime" tick={{fill: '#94a3b8', fontSize: 10}} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '5px' }}
                      formatter={(value: number) => [new Intl.NumberFormat('fa-IR').format(value), currencyLabel]}
                    />
                    <Area type="monotone" dataKey="price" stroke={isPositive ? '#10b981' : '#ef4444'} fill="url(#chartGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-6">
               {/* Price Range Bar */}
               <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>پایین‌ترین ({currencyLabel})</span>
                    <span>بالاترین ({currencyLabel})</span>
                  </div>
                  <div className="flex justify-between items-end mb-2 font-bold text-white">
                     <span>{formatPrice(minPrice)}</span>
                     <span>{formatPrice(maxPrice)}</span>
                  </div>
                  <div className="relative w-full h-3 bg-slate-700 rounded-full overflow-visible">
                     <div 
                        className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" 
                        style={{ width: '100%' }}
                     ></div>
                     <div 
                        className="absolute w-5 h-5 bg-white rounded-full border-4 border-slate-800 shadow-xl top-1/2 -translate-y-1/2 transition-all duration-500"
                        style={{ right: `${100 - rangePercent}%` }}
                     ></div>
                  </div>
                  <div className="text-center mt-3 text-xs text-slate-400">
                    موقعیت قیمت فعلی در بازه زمانی نمودار
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <span className="text-slate-400 text-xs block mb-1">میانگین قیمت</span>
                      <span className="text-lg font-bold text-white">{formatPrice(avgPrice)}</span>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <span className="text-slate-400 text-xs block mb-1">تغییر ارزش (امروز)</span>
                      <span className={`text-lg font-bold ${asset.changeAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPrice(asset.changeAmount * multiplier)}
                      </span>
                  </div>
               </div>
            </div>
          )}

          {/* Calculator Tab */}
          {activeTab === 'CALCULATOR' && (
            <div className="flex flex-col gap-6 items-center justify-center py-4">
               <div className="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                  <label className="block text-slate-400 text-xs mb-2">تعداد / مقدار {asset.nameFa}</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={calcAmount}
                      onChange={handleCalcAmountChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-2xl font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors pl-12 text-left dir-ltr"
                      placeholder="1"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">{asset.nameEn}</span>
                  </div>
               </div>

               <div className="p-2 bg-slate-700/50 rounded-full text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
               </div>

               <div className="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                  <label className="block text-slate-400 text-xs mb-2">ارزش معادل به {currencyLabel}</label>
                  <div className="relative">
                    <div className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-2xl font-bold text-green-400 text-left dir-ltr">
                       {calcResult}
                    </div>
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">{currencyLabel}</span>
                  </div>
               </div>
               
               <p className="text-xs text-slate-500 text-center">
                 محاسبه بر اساس آخرین نرخ بروزرسانی شده انجام شده است.
               </p>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'HISTORY' && (
            <div className="overflow-hidden rounded-xl border border-slate-700/50">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3 font-medium">زمان</th>
                    <th className="p-3 font-medium">قیمت ({currencyLabel})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {/* Show last 20 records reversed */}
                  {[...asset.history].reverse().slice(0, 20).map((pt, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 text-slate-300 font-mono">
                        {new Date(pt.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3 text-white font-bold">
                        {formatPrice(pt.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 text-center text-xs text-slate-500 bg-slate-800/20">
                نمایش ۲۰ رکورد آخر
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};