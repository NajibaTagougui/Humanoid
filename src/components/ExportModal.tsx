import React, { useState } from 'react';
import { HumanoidSequence } from '../types';
import { exportToBVH } from '../utils/motionMath';
import { Download, Copy, Check, X, FileText, Code2, Award } from 'lucide-react';

interface Props {
  sequence: HumanoidSequence;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ sequence, isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadBVH = () => {
    const bvhContent = exportToBVH(sequence);
    const blob = new Blob([bvhContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sequence.id}_humanoid_motion.bvh`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(sequence, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sequence.id}_vhh_kinematics.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(sequence, null, 2));
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Export Humanoid VHH Kinematics</h3>
              <p className="text-xs text-slate-400">Standard formats for 3D engines, Blender, & robotics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sequence Overview */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Sequence Title:</span>
            <span className="text-slate-200 font-semibold">{sequence.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Keyframe Count:</span>
            <span className="font-mono text-slate-200">{sequence.keyframes.length} frames</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Physical Validity Certification:</span>
            <span className="font-mono text-emerald-400 font-medium">
              {sequence.validityMetrics.overallValidityIndex.toFixed(1)}% Verified
            </span>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-2.5">
          {/* BVH Export Card */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-sky-400" />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">BVH Skeletal Motion</h4>
                <p className="text-[11px] text-slate-400">BioVision hierarchy with 6-DOF joint rotations</p>
              </div>
            </div>
            <button
              id="download-bvh-btn"
              onClick={handleDownloadBVH}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .bvh</span>
            </button>
          </div>

          {/* JSON Full Dataset Card */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code2 className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Full Kinematics & FACS JSON</h4>
                <p className="text-[11px] text-slate-400">Includes complete facial AU blendshape curves & CoM</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                id="copy-json-btn"
                onClick={handleCopyJSON}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                title="Copy JSON to clipboard"
              >
                {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                id="download-json-btn"
                onClick={handleDownloadJSON}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
