import React from 'react';
import { Monument } from '../types';
import { ArrowRight } from 'lucide-react';

interface MonumentCardProps {
  monument: Monument;
  onDiscover: (monument: Monument) => void;
}

export const MonumentCard: React.FC<MonumentCardProps> = ({
  monument,
  onDiscover,
}) => {
  return (
    <article
      id={`monument-card-${monument.id}`}
      className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] overflow-hidden flex flex-col w-full transition-all hover:shadow-md"
    >
      {/* Clean, Full-width Photography with Hero Protagonism */}
      <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-[#4A3728]">
        {monument.imageUrl ? (
          <img
            src={monument.imageUrl}
            alt={monument.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#E6D5B8] text-xs font-bold uppercase tracking-wider">
            {monument.name}
          </div>
        )}
      </div>

      {/* Card Content: Name, Subtitle, Short Description, Big Discover Button */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-3.5">
        <div className="space-y-1.5">
          <div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#4A3728] leading-snug">
              {monument.name}
            </h3>

            {monument.subtitle && (
              <p className="text-xs font-bold text-[#A0522D] tracking-wide mt-0.5">
                {monument.subtitle}
              </p>
            )}
          </div>

          <p className="text-[13px] sm:text-sm text-[#5D4037] leading-relaxed font-normal">
            {monument.originalText.shortDescription}
          </p>
        </div>

        {/* Big "Descubrir" Button */}
        <button
          id={`btn-discover-${monument.id}`}
          onClick={() => onDiscover(monument)}
          className="w-full bg-[#C5A059] hover:bg-[#b8944f] text-[#4A3728] font-black text-sm py-3.5 rounded-2xl uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Descubrir</span>
          <ArrowRight className="w-4 h-4 text-[#4A3728]" />
        </button>
      </div>
    </article>
  );
};
