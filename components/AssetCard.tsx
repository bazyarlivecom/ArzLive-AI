import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  currencyMode: 'TOMAN' | 'RIAL';
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, currencyMode }) => {
  const isPositive = asset.change24h >= 0;
  
  // Calculate display price based on mode (1 Toman = 10 Rials)
  const displayPrice = currencyMode === 'TOMAN' ? asset.priceToman : asset.priceToman * 10;
  const currencyLabel = currencyMode === 'TOMAN' ? 'تومان' : 'ریال';

  // Format numbers with commas
  const formattedPrice = new Intl.NumberFormat('fa-IR').format(displayPrice);
  const formattedChange = new Intl.NumberFormat('fa-IR', { 
    signDisplay: 'exceptZero', 
    maximumFractionDigits: 2 
  }).format(asset.change24h);

  return (
    <div className="bg-secondary rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700/50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-100 font-bold text-lg">{asset.nameFa}</h3>
          <span className="text-slate-400 text-xs font-mono">{asset.nameEn}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          <span dir="ltr">{formattedChange}%</span>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${!isPositive && 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </div>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formattedPrice}
            <span className="text-sm text-slate-400 mr-2 font-normal">{currencyLabel}</span>
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-16 w-full opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={asset.history}>
            <defs>
              <linearGradient id={`color-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#10b981' : '#ef4444'} 
              fillOpacity={1} 
              fill={`url(#color-${asset.id})`} 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};