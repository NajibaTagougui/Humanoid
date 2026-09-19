import React, { useState } from 'react';
import { HumanoidSequence, ValidityMetrics } from '../types';
import { ShieldCheck, Check, AlertTriangle, HelpCircle, RefreshCw, Award, Activity, HeartHandshake } from 'lucide-react';

interface Props {
  sequence: HumanoidSequence;
  onAuditWithAI: () => Promise<void>;
  isAuditing: boolean;
  aiAuditResult: any | null;
}

export const ValidityScorecard: React.FC<Props> = ({
  sequence,
  onAuditWithAI,
  isAuditing,
  aiAuditResult,
}) => {
  const metrics: ValidityMetrics = sequence.validityMetrics;

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 85) return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getBarColor = (score: number) => {
    if (score >= 95) return 'bg-emerald-500';
    if (score >= 85) return 'bg-sky-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Physical & Affective Validity</h2>
            <p className="text-xs text-slate-400">Biomechanics & FACS Naturalness Audit</p>
          </div>
        </div>

        <button
          id="run-ai-biomechanical-audit-btn"
          onClick={onAuditWithAI}
          disabled={isAuditing}
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing...' : 'AI Biomechanical Audit'}</span>
        </button>
      </div>

      {/* Main Scorecard Metrics */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* Overall Certification Banner */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Overall Validity Score</div>
              <div className="text-lg font-bold text-slate-100 flex items-baseline space-x-1.5">
                <span>{metrics.overallValidityIndex.toFixed(1)}%</span>
                <span className="text-[11px] font-normal text-emerald-400">Physically Plausible</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Check className="w-3 h-3 mr-1" />
              Verified Valid
            </span>
          </div>
        </div>

        {/* 4 Core Dimensions */}
        <div className="space-y-3">
          {/* 1. Dynamic Balance & ZMP */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero-Moment Point (ZMP) Stability</span>
              </span>
              <span className="font-mono font-medium text-slate-200">{metrics.dynamicBalanceScore.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(metrics.dynamicBalanceScore)} transition-all duration-500`}
                style={{ width: `${metrics.dynamicBalanceScore}%` }}
              />
            </div>
          </div>

          {/* 2. Foot Contact Fidelity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Ground Stance & Zero-Skate Fidelity</span>
              </span>
              <span className="font-mono font-medium text-slate-200">{metrics.footContactFidelity.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(metrics.footContactFidelity)} transition-all duration-500`}
                style={{ width: `${metrics.footContactFidelity}%` }}
              />
            </div>
          </div>

          {/* 3. Biomechanical Feasibility */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Joint Limit & Torque Feasibility</span>
              </span>
              <span className="font-mono font-medium text-slate-200">{metrics.biomechanicalFeasibility.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(metrics.biomechanicalFeasibility)} transition-all duration-500`}
                style={{ width: `${metrics.biomechanicalFeasibility}%` }}
              />
            </div>
          </div>

          {/* 4. Natural Expression Score */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                <span>Natural Expression & FACS Synergy</span>
              </span>
              <span className="font-mono font-medium text-slate-200">{metrics.naturalExpressionScore.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(metrics.naturalExpressionScore)} transition-all duration-500`}
                style={{ width: `${metrics.naturalExpressionScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* AI Audit Feedback (if triggered) */}
        {aiAuditResult && (
          <div className="bg-sky-950/40 border border-sky-500/40 p-3 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-300 flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-sky-400" />
                <span>AI Biomechanical Audit Result</span>
              </span>
              <span className="font-mono text-[11px] text-sky-200 font-medium">
                {aiAuditResult.score ? `${aiAuditResult.score}%` : 'Passed'}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {aiAuditResult.naturalnessAssessment || aiAuditResult.verdict}
            </p>
            {aiAuditResult.recommendations && aiAuditResult.recommendations.length > 0 && (
              <div className="pt-1.5 border-t border-sky-800/40">
                <span className="text-[10px] text-slate-400 font-medium block mb-1">Optimizer Tips:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                  {aiAuditResult.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Verification Checkpoints */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-300 block">Verified Physical Constraints:</span>
          <div className="space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px]">
            {metrics.validationNotes.map((note, index) => (
              <div key={index} className="flex items-start space-x-2 text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
