import React, { useMemo } from 'react';

interface BlueprintElement {
  role: 'focal' | 'greenery' | 'filler' | 'accent';
  theta: number; // degrees
  radius: number; // 0 to 1
  size: number;
}

interface BlueprintCanvasProps {
  elements: BlueprintElement[];
  size?: number;
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({ elements, size = 600 }) => {
  const center = size / 2;
  const maxRadius = center - 50;

  const renderedElements = useMemo(() => {
    return elements.map((el, i) => {
      const thetaRad = (el.theta - 90) * (Math.PI / 180);
      const r = el.radius * maxRadius;
      const x = center + r * Math.cos(thetaRad);
      const y = center + r * Math.sin(thetaRad);
      
      const roleColors: Record<string, string> = {
        focal: '#f43f5e',
        greenery: '#22c55e',
        filler: '#eab308',
        accent: '#3b82f6'
      };

      return {
        ...el,
        x,
        y,
        color: roleColors[el.role] || '#94a3b8'
      };
    });
  }, [elements, center, maxRadius]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-background rounded-full border border-foreground/10 shadow-inner">
      {/* Wreath Base */}
      <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" />
      
      {/* Elements */}
      {renderedElements.map((el, i) => (
        <g key={i}>
          <circle 
            cx={el.x} 
            cy={el.y} 
            r={el.size * 10} 
            fill={el.color} 
            fillOpacity="0.8"
          />
          {/* Label */}
          <text 
            x={el.x} 
            y={el.y + 20} 
            textAnchor="middle" 
            className="text-[8px] fill-foreground opacity-60 uppercase tracking-widest"
          >
            {el.role}
          </text>
        </g>
      ))}

      {/* Angle Markers (Clock Positions) */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const x1 = center + (maxRadius + 10) * Math.cos(rad);
        const y1 = center + (maxRadius + 10) * Math.sin(rad);
        const x2 = center + (maxRadius + 20) * Math.cos(rad);
        const y2 = center + (maxRadius + 20) * Math.sin(rad);
        
        return (
          <line 
            key={deg} 
            x1={x1} y1={y1} 
            x2={x2} y2={y2} 
            stroke="currentColor" 
            strokeOpacity="0.2" 
          />
        );
      })}
    </svg>
  );
};
