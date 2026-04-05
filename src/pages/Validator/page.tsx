import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, CheckCircle2, AlertTriangle, XCircle, Copy, RefreshCw } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Import the validation logic from a helper or define it here
import { validate } from '../../lib/validatorEngine';

export default function Validator() {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runValidation = () => {
    if (!jsonInput.trim()) {
      toast.error('Please paste a blueprint JSON first.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const validationResult = validate(jsonInput);
      setResult(validationResult);
      setLoading(false);
    }, 600);
  };

  const clearAll = () => {
    setJsonInput('');
    setResult(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-serif text-neutral-900">EC_WR_V2 Validator</h1>
        <p className="text-neutral-600 mt-2">Blueprint quality gate and auto-repair engine.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 mb-8">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Blueprint JSON</label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full p-4 font-mono text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          rows={14}
          placeholder='Paste your blueprint JSON here...'
        />
        <div className="flex gap-4 mt-4">
          <button onClick={runValidation} disabled={loading} className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-neutral-800 flex items-center gap-2">
            {loading ? <RefreshCw className="animate-spin w-4 h-4" /> : <Zap className="w-4 h-4" />}
            Validate Blueprint
          </button>
          <button onClick={clearAll} className="px-6 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100">Clear</button>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border ${result.verdict === 'valid' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <h2 className="text-xl font-serif font-semibold">{result.verdict === 'valid' ? 'Blueprint Valid' : 'Blueprint Invalid'}</h2>
            <p className="text-sm mt-1">{result.stats.pass} checks passed, {result.stats.fail} failed.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h3 className="font-serif text-lg mb-4">Detailed Findings</h3>
            <ul className="space-y-3">
              {result.checks.map((check: any, i: number) => (
                <li key={i} className={`p-4 rounded-lg flex items-start gap-3 ${check.status === 'pass' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  {check.status === 'pass' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <div>
                    <p className="font-medium text-sm">{check.label}</p>
                    <p className="text-xs mt-1 opacity-90">{check.msg}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
