import React, { useMemo } from 'react';
import { Card, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface DesignIntelligencePanelProps {
  blueprint: any;
}

export const DesignIntelligencePanel: React.FC<DesignIntelligencePanelProps> = ({ blueprint }) => {
  const intelligence = useMemo(() => {
    if (!blueprint || !Array.isArray(blueprint.elements)) return null;

    const issues: { type: 'warning' | 'info', message: string }[] = [];
    const elements = blueprint.elements;
    
    // 1. Balance Check
    const quadrantMass = [0, 0, 0, 0];
    elements.forEach((item: any) => {
      // Use scale as a proxy for mass/visual weight
      const mass = item.scale || 1;
      const quadrant = Math.floor(item.theta / 90) % 4;
      quadrantMass[quadrant] += mass;
    });
    
    const maxMass = Math.max(...quadrantMass);
    const minMass = Math.min(...quadrantMass);
    if (maxMass / (minMass || 1) > 2.5) {
      issues.push({ type: 'warning', message: 'Composition appears unbalanced. Try distributing focal clusters more evenly.' });
    }

    // 2. Open Arc Check
    if (blueprint.open_arc && (blueprint.open_arc[1] - blueprint.open_arc[0]) > 180) {
      issues.push({ type: 'info', message: 'Large open arc detected. Ensure the remaining elements have enough visual weight to anchor the design.' });
    }

    // 3. Size Guidance
    const totalElements = elements.length;
    if (totalElements < 20) {
      issues.push({ type: 'warning', message: 'Sparse composition: Total element count is low. Consider increasing cluster density.' });
    } else if (totalElements > 150) {
      issues.push({ type: 'warning', message: 'Overcrowded composition: Total element count is very high. Consider simplifying.' });
    }

    // 4. Role Distribution
    const roleCounts: Record<string, number> = {};
    elements.forEach((item: any) => {
      roleCounts[item.role] = (roleCounts[item.role] || 0) + 1;
    });
    
    if (roleCounts['focal'] && roleCounts['greenery']) {
      const focalRatio = roleCounts['focal'] / totalElements;
      if (focalRatio > 0.4) {
        issues.push({ type: 'info', message: 'High focal density: Too many focal points can overwhelm the viewer. Consider adding more greenery or filler.' });
      }
    }

    return issues;
  }, [blueprint]);

  return (
    <Card className="p-6 bg-background border border-foreground/10 rounded-lg space-y-4">
      <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
        <Info className="w-4 h-4" />
        Design Intelligence Active
      </CardTitle>
      
      {intelligence && intelligence.length > 0 ? (
        <ul className="space-y-2">
          {intelligence.map((issue, i) => (
            <li key={i} className={`text-xs flex items-start gap-2 ${issue.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}>
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-emerald-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Composition looks balanced and well-structured.
        </div>
      )}
      
      <div className="pt-4 border-t border-foreground/5 text-[9px] opacity-40 uppercase tracking-tighter">
        Palette Contrast: Ensure focal elements have at least 4.5:1 contrast ratio against the base foliage for optimal visual impact.
      </div>
    </Card>
  );
};
