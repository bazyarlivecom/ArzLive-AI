import React from 'react';
import { Asset, AssetType } from '../types';

interface MarketHighlightsProps {
  assets: Asset[];
  currencyMode: 'TOMAN' | 'RIAL';
}

export const MarketHighlights: React.FC<MarketHighlightsProps> = ({ assets, currencyMode }) => {
  if (assets.length === 0) return null;

  // Logic to find highlights
  const sortedByChange = [...assets].sort((a, b) => b.change24h - a.change24h);
  const topGainer = sortedByChange[0];
  const topLoser = sortedByChange[sortedByChange.length - 1];
  
  // Find Gold 18k for standard reference
  const gold = assets.find(a => a.id === 'gold_18');

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fa-IR').format(Math.floor(currencyMode === 'TOMAN' ? price : price * 10));

  const HighlightCard = ({ title, asset, type }: { title: string, asset?: Asset, type: 'gain' | 'loss' | 'neutral' }) => {
    if (!asset) return null;
    const isPositive = asset.change24h >= 0;
    
    return (
      <div className="bg-secondary/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${type === 'gain' ? 'bg-green-500' : type === 'loss' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
        <div className="flex flex-col z-10">
          <span className="text-slate-400 text-xs mb-1 font-medium">{title}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">{asset.nameFa}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`} dir="ltr">
              {asset.change24h}%
            </span>
          </div>
          <span className="text-slate-300 text-sm mt-1">
            {formatPrice(asset.priceToman)} <span className="text-[10px] text-slate-500">{currencyMode === 'TOMAN' ? 'تومان' : 'ریال'}</span>
          </span>
        </div>
        <div className={`text-2xl p-3 rounded-full bg-slate-800 ${type === 'gain' ? 'text-green-500' : type === 'loss' ? 'text-red-500' : 'text-yellow-500'}`}>
            {type === 'gain' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            {type === 'loss' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
            {type === 'neutral' && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
      {topGainer && <HighlightCard title="بیشترین رشد (۲۴س)" asset={topGainer} type="gain" />}
      {topLoser && <HighlightCard title="بیشترین افت (۲۴س)" asset={topLoser} type="loss" />}
      {gold && <HighlightCard title="شاخص بازار طلا" asset={gold} type="neutral" />}
    </div>
  );
};