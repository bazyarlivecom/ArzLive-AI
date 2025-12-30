import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  currencyMode: 'TOMAN' | 'RIAL';
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  onClick: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, currencyMode, isFavorite, onToggleFavorite, onClick }) => {
  const isPositive = asset.change24h >= 0;
  
  // Calculate display price
  const displayPrice = currencyMode === 'TOMAN' ? asset.priceToman : asset.priceToman * 10;
  const currencyLabel = currencyMode === 'TOMAN' ? 'تومان' : 'ریال';

  const formattedPrice = new Intl.NumberFormat('fa-IR').format(Math.floor(displayPrice));
  const formattedChange = new Intl.NumberFormat('fa-IR', { 
    signDisplay: 'exceptZero', 
    maximumFractionDigits: 2 
  }).format(asset.change24h);

  // Simplified chart data for card (sparkline)
  const chartData = asset.history.slice(-20).map(pt => ({
    price: pt.price
  }));

  return (
    <div 
      onClick={() => onClick(asset)}
      className="bg-secondary rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-700/50 flex flex-col cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h3 className="text-slate-100 font-bold text-lg">{asset.nameFa}</h3>
            <span className="text-slate-400 text-xs font-mono">{asset.nameEn}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={(e) => onToggleFavorite(e, asset.id)}
                className={`p-1.5 rounded-lg transition-colors z-20 ${isFavorite ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:text-slate-400 hover:bg-slate-700/50'}`}
            >
                {isFavorite ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.563.045.796.77.398 1.115l-4.225 3.635a.563.563 0 00-.166.505l1.238 5.37c.125.545-.449.957-.923.665l-4.708-2.887a.563.563 0 00-.57 0l-4.708 2.887c-.475.292-1.048-.12-.923-.665l1.238-5.37a.563.563 0 00-.166-.505l-4.225-3.635c-.398-.345-.165-1.07.398-1.115l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                )}
            </button>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold backdrop-blur-sm ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            <span dir="ltr">{formattedChange}%</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${!isPositive && 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            </div>
        </div>
      </div>

      <div className="mb-4 relative z-10">
        <div className="text-2xl font-bold text-white tracking-tight">
          {formattedPrice}
          <span className="text-xs text-slate-400 mr-2 font-normal">{currencyLabel}</span>
        </div>
      </div>

      {/* Mini Sparkline Chart */}
      <div className="h-16 w-full mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.4}/>
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? '#10b981' : '#ef4444'} 
              fill={`url(#grad-${asset.id})`} 
              strokeWidth={2} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">برای جزئیات بیشتر کلیک کنید</span>
      </div>
    </div>
  );
};