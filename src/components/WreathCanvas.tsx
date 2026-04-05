// src/components/WreathCanvas.tsx

import React, { useState } from 'react';
import { Stage, Layer, Circle, Star, Ellipse } from 'react-konva';
import { Blueprint } from '../types';
import { engineToUI } from '../services/transformer';

export const WreathCanvas: React.FC<{ blueprint: Blueprint }> = ({ blueprint }) => {
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusMap = { inner: 80, mid: 120, outer: 160, edge: 180 };

  // Sort by category for correct layering
  const categoryOrder = { greenery: 0, focal: 1, filler: 2, accent: 3, secondary: 4 };
  
  // Use legacy blueprint array or transform new elements array
  const elements = blueprint.blueprint || (blueprint.elements ? blueprint.elements.map(engineToUI) : []);
  const sortedBlueprint = [...elements].sort((a: any, b: any) => {
    const catA = (a.category || a.role) as keyof typeof categoryOrder;
    const catB = (b.category || b.role) as keyof typeof categoryOrder;
    return (categoryOrder[catA] || 0) - (categoryOrder[catB] || 0);
  });

  const [hovered, setHovered] = useState<number | null>(null);

  const renderStem = (stem: any, i: number) => {
    const clockPos = stem.clock_position || '12:00';
    const [hours, minutes] = clockPos.split(':').map(Number);
    const angleDeg = stem.theta !== undefined ? stem.theta : ((hours % 12) * 30 + (minutes / 60) * 30);
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    
    const layer = stem.radius_label || stem.layer || stem.radius || 'mid';
    const r = typeof layer === 'number' ? (layer * 180) : (radiusMap[layer as keyof typeof radiusMap] || 120);
    
    const x = centerX + r * Math.cos(angleRad);
    const y = centerY + r * Math.sin(angleRad);

    const commonProps = {
      x, y,
      fill: stem.color || '#c9a96e',
      opacity: hovered === i ? 1 : 0.8,
      onMouseEnter: () => setHovered(i),
      onMouseLeave: () => setHovered(null),
      scaleX: stem.scale || 1,
      scaleY: stem.scale || 1,
      rotation: stem.rotation || 0
    };

    const category = stem.category || stem.role;

    switch (category) {
      case 'focal':
        return <Star key={i} {...commonProps} numPoints={5} innerRadius={6} outerRadius={15} rotation={angleDeg} />;
      case 'greenery':
        return <Ellipse key={i} {...commonProps} radiusX={15} radiusY={8} rotation={angleDeg} />;
      case 'filler':
        return <Circle key={i} {...commonProps} radius={4} />;
      case 'accent':
        return <Circle key={i} {...commonProps} radius={6} stroke="gold" strokeWidth={2} />;
      default:
        return <Circle key={i} {...commonProps} radius={4} />;
    }
  };

  return (
    <Stage width={width} height={height} className="border border-surface rounded-lg bg-neutral-50">
      <Layer>
        {/* Frame */}
        <Circle x={centerX} y={centerY} radius={180} stroke="#c9a96e" strokeWidth={10} />
        
        {/* Stems */}
        {sortedBlueprint.map(renderStem)}
      </Layer>
    </Stage>
  );
};
