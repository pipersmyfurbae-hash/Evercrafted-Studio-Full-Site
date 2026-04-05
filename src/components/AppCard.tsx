import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { ArrowRight } from 'lucide-react';

interface AppCardProps {
  title: string;
  description?: string;
  link: string;
  icon?: React.ReactNode;
}

export function AppCard({ title, description, link, icon }: AppCardProps) {
  return (
    <Link to={link} className="block group">
      <Card className="border border-ink/5 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-ink/20 transition-all h-full">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-cream rounded-none text-ink">
              {icon || <div className="w-5 h-5 bg-sage/20 rounded-full" />}
            </div>
            <ArrowRight className="w-4 h-4 text-muted-studio/40 group-hover:text-ink transition-colors" />
          </div>
          <h3 className="display-text text-sm mb-2">{title}</h3>
          {description && (
            <p className="text-[10px] text-muted-studio/60 font-serif italic leading-relaxed">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
