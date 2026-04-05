import React, { useState, useEffect } from 'react';
import { Blueprint, EmotionProfile, ScoreReport, RepairOption } from '../types';
import { scoreBlueprint, getBasicRepairs, getAdvancedRepairs } from '../services/blueprintScoringEngine';

interface QualityGateProps {
  blueprint: Blueprint;
  emotionProfile?: EmotionProfile;
  onRepair: (updatedBlueprint: Blueprint) => void;
}

export const QualityGate: React.FC<QualityGateProps> = ({ blueprint, emotionProfile, onRepair }) => {
  const [report, setReport] = useState<ScoreReport>(scoreBlueprint(blueprint, emotionProfile));
  const [selectedRepairs, setSelectedRepairs] = useState<RepairOption[]>([]);

  useEffect(() => {
    setReport(scoreBlueprint(blueprint, emotionProfile));
  }, [blueprint, emotionProfile]);

  const handleRepairSelection = (repair: RepairOption) => {
    setSelectedRepairs(prev => 
      prev.find(r => r.id === repair.id) 
        ? prev.filter(r => r.id !== repair.id)
        : [...prev, repair]
    );
  };

  const handleApplyRepairs = () => {
    let updatedBlueprint = { ...blueprint };
    selectedRepairs.forEach(repair => {
      updatedBlueprint = repair.apply(updatedBlueprint);
    });
    const newReport = scoreBlueprint(updatedBlueprint, emotionProfile);
    setReport(newReport);
    onRepair(updatedBlueprint);
    setSelectedRepairs([]);
  };

  const getDiagnoses = () => {
    return Object.entries(report.dimensions)
      .filter(([_, score]) => (score as number) < 20)
      .map(([dim, score]) => ({
        dimension: dim,
        score: score as number,
        basic: getBasicRepairs(blueprint, dim),
        advanced: getAdvancedRepairs(blueprint, dim)
      }));
  };

  const diagnoses = getDiagnoses();

  return (
    <div className="p-6 bg-white-studio border border-ink/10 rounded-lg">
      <h2 className="text-2xl font-serif mb-6">Blueprint Score Report</h2>
      
      <div className="space-y-4 mb-8">
        {(Object.entries(report.dimensions) as [keyof ScoreReport['dimensions'], number][]).map(([dim, score]) => (
          <div key={dim} className="flex items-center gap-4">
            <span className="w-48 capitalize">{dim.replace(/([A-Z])/g, ' $1')}</span>
            <div className="flex-1 h-4 bg-ink/5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${ (score as number) < 20 ? 'bg-red-400' : 'bg-[#d4c3a1]'}`} 
                style={{ width: `${((score as number) / 25) * 100}%` }}
              />
            </div>
            <span className="w-16 text-right font-mono">{score}/25</span>
          </div>
        ))}
      </div>

      <div className="text-xl font-bold mb-8">TOTAL: {report.total}/100 - {report.status}</div>

      {report.warnings.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-2">Warnings</h3>
          <ul className="space-y-1">
            {report.warnings.map((warning, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                <span>•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {report.status === 'REPAIR NEEDED' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Diagnosis & Repair</h3>
          {diagnoses.map(d => (
            <div key={d.dimension} className="border-t pt-4">
              <p className="font-bold text-red-600 capitalize">{d.dimension.replace(/([A-Z])/g, ' $1')} — Score: {d.score}/25</p>
              <p className="text-sm mb-2">Issue: Needs improvement in this area.</p>
              <div className="grid grid-cols-2 gap-2">
                {[...d.basic, ...d.advanced].map(repair => (
                  <button 
                    key={repair.id}
                    onClick={() => handleRepairSelection(repair)}
                    className={`p-2 text-xs border ${selectedRepairs.find(r => r.id === repair.id) ? 'bg-ink text-white-studio' : 'bg-white-studio'}`}
                  >
                    {repair.label} ({repair.type})
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button 
            onClick={handleApplyRepairs}
            className="w-full px-6 py-3 bg-ink text-white-studio font-bold uppercase tracking-widest text-xs hover:bg-ink/80"
          >
            Apply Selected Repairs
          </button>
        </div>
      )}
    </div>
  );
};
