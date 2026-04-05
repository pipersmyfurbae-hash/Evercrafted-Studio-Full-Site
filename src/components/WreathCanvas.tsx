// src/components/WreathCanvas.tsx

import React, { useState } from 'react';
import { Stage, Layer, Circle, Star, Ellipse, Line, Text, Group } from 'react-konva';
import { Blueprint } from '../types';
import { buildRenderLayout, generateDebugOverlay, RenderElement } from '../services/engine/evercrafted-engine';

export const WreathCanvas: React.FC<{ blueprint: Blueprint; debug?: boolean }> = ({ blueprint, debug = false }) => {
  const width = 400;
  const height = 400;
  
  // Base radius for the wreath frame
  const baseRadius = 180;
  
  // Use normalized blueprint array
  const rawElements = blueprint.blueprint || (blueprint.elements ? blueprint.elements : []);
  const layout = buildRenderLayout(rawElements as any[], width, height);
  
  // Sort by category for correct layering
  const categoryOrder = { greenery: 0, focal: 1, secondary: 2, filler: 3, accent: 4 };
  const sortedElements = [...layout].sort((a, b) => {
    return (categoryOrder[a.category] || 0) - (categoryOrder[b.category] || 0);
  });

  const [hovered, setHovered] = useState<string | null>(null);
  const debugOverlay = generateDebugOverlay(width, height);

  const renderElement = (el: RenderElement, i: number) => {
    const commonProps = {
      x: el.x,
      y: el.y,
      fill: '#c9a96e', // Default color
      opacity: hovered === el.id ? 1 : 0.8,
      onMouseEnter: () => setHovered(el.id),
      onMouseLeave: () => setHovered(null),
      scaleX: 1,
      scaleY: 1,
      rotation: el.angle_deg
    };

    return (
      <Group key={el.id}>
        {el.category === 'focal' && <Star {...commonProps} numPoints={5} innerRadius={6} outerRadius={15} fill="#f43f5e" />}
        {el.category === 'secondary' && <Star {...commonProps} numPoints={6} innerRadius={8} outerRadius={12} fill="#d4af37" />}
        {el.category === 'greenery' && <Ellipse {...commonProps} radiusX={15} radiusY={8} fill="#4A6741" />}
        {el.category === 'filler' && <Circle {...commonProps} radius={4} fill="#8B4513" />}
        {el.category === 'accent' && <Circle {...commonProps} radius={6} stroke="gold" strokeWidth={2} fill="#FFD700" />}
        {!['focal', 'secondary', 'greenery', 'filler', 'accent'].includes(el.category) && <Circle {...commonProps} radius={4} />}
        
        {debug && (
          <Text 
            x={el.x + 10} 
            y={el.y + 10} 
            text={`${el.element}\n${el.angle_deg}°`} 
            fontSize={8} 
            fill="#666" 
            fontFamily="monospace"
            listening={false}
          />
        )}
      </Group>
    );
  };

  return (
    <Stage width={width} height={height} className="border border-surface rounded-lg bg-neutral-50 shadow-inner">
      <Layer>
        {/* Debug: Radius Rings */}
        {debug && debugOverlay.rings.map((ring, idx) => (
          <Circle 
            key={`ring-${idx}`} 
            x={debugOverlay.center.x} 
            y={debugOverlay.center.y} 
            radius={ring.radius} 
            stroke="#ccc" 
            strokeWidth={0.5} 
            dash={[5, 5]} 
            listening={false}
          />
        ))}

        {/* Debug: Angle Lines */}
        {debug && debugOverlay.angles.map((angleObj, i) => {
          const rad = (angleObj.angle - 90) * (Math.PI / 180);
          return (
            <Line 
              key={`line-${i}`}
              points={[
                debugOverlay.center.x, 
                debugOverlay.center.y, 
                debugOverlay.center.x + baseRadius * Math.cos(rad), 
                debugOverlay.center.y + baseRadius * Math.sin(rad)
              ]}
              stroke="#eee"
              strokeWidth={1}
              listening={false}
            />
          );
        })}

        {/* Frame */}
        <Circle x={width/2} y={height/2} radius={baseRadius} stroke="#c9a96e" strokeWidth={10} />
        
        {/* Cluster Highlights (Designer-Grade Visual Weight) */}
        {/* We can derive clusters from layout if needed, but the engine already grouped them */}
        {/* For now, let's just render elements */}

        {/* Elements */}
        {sortedElements.map(renderElement)}
      </Layer>
    </Stage>
  );
};
