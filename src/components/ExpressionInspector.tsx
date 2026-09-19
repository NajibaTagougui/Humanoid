import React from 'react';
import { FacialBlendshapes } from '../types';
import { Smile, Eye, MessageSquare, SlidersHorizontal, Sparkles } from 'lucide-react';

interface Props {
  blendshapes: FacialBlendshapes;
  onChangeBlendshape: (key: keyof FacialBlendshapes, val: number) => void;
  onApplyViseme: (viseme: string) => void;
}

export const ExpressionInspector: React.FC<Props> = ({
  blendshapes,
  onChangeBlendshape,
  onApplyViseme,
}) => {
  const visemes = [
    { label: 'Neutral Rest', code: 'REST', desc: 'Closed lips, gentle rest' },
    { label: 'Phoneme /AA/', code: 'AA', desc: 'Open vowel (father)' },
    { label: 'Phoneme /IY/', code: 'IY', desc: 'Spread lips (see)' },
    { label: 'Phoneme /UW/', code: 'UW', desc: 'Rounded lips (too)' },
    { label: 'Phoneme /M,B,P/', code: 'MBP', desc: 'Bilabial closure' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Smile className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">FACS Blendshapes Studio</h2>
            <p className="text-xs text-slate-400">Facial Action Units & Viseme Articulation</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
          Live Interactive
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* Phoneme & Speech Viseme Bar */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Speech Viseme Testing:</span>
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {visemes.map((v) => (
              <button
                key={v.code}
                id={`viseme-btn-${v.code}`}
                onClick={() => onApplyViseme(v.code)}
                className="px-1.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-center transition-colors group"
                title={v.desc}
              >
                <span className="block text-[11px] font-bold text-slate-200 group-hover:text-sky-400">
                  {v.code}
                </span>
                <span className="block text-[9px] text-slate-500 truncate">
                  {v.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Live FACS Sliders */}
        <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-xs font-medium text-slate-300 block mb-2">
            Action Unit Articulators:
          </span>

          {/* Smile AU12 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">AU12 - Lip Corner Puller (Smile)</span>
              <span className="font-mono text-amber-400 font-medium">
                {(blendshapes.smileAU12 * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="slider-au12-smile"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={blendshapes.smileAU12}
              onChange={(e) => onChangeBlendshape('smileAU12', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Cheek Raiser AU6 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">AU6 - Cheek Raiser (Duchenne)</span>
              <span className="font-mono text-amber-400 font-medium">
                {(blendshapes.cheekRaiserAU6 * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="slider-au6-cheek"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={blendshapes.cheekRaiserAU6}
              onChange={(e) => onChangeBlendshape('cheekRaiserAU6', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Brow Raise AU1+AU2 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">AU1+AU2 - Brow Raiser (Surprise/Open)</span>
              <span className="font-mono text-amber-400 font-medium">
                {(blendshapes.browRaiseAU1_2 * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="slider-au1-2-brow"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={blendshapes.browRaiseAU1_2}
              onChange={(e) => onChangeBlendshape('browRaiseAU1_2', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Brow Furrow AU4 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">AU4 - Brow Lowerer (Focus/Concern)</span>
              <span className="font-mono text-amber-400 font-medium">
                {(blendshapes.browFurrowAU4 * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="slider-au4-furrow"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={blendshapes.browFurrowAU4}
              onChange={(e) => onChangeBlendshape('browFurrowAU4', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Mouth Open AU25+AU26 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">AU25+26 - Jaw Drop & Lips Part</span>
              <span className="font-mono text-amber-400 font-medium">
                {(blendshapes.mouthOpenAU25_26 * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="slider-au25-mouth"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={blendshapes.mouthOpenAU25_26}
              onChange={(e) => onChangeBlendshape('mouthOpenAU25_26', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Blink AU45 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">AU45 - Eyelid Blink Closure</span>
              <span className="font-mono text-amber-400 font-medium">
                {(blendshapes.blinkAU45 * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id="slider-au45-blink"
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={blendshapes.blinkAU45}
              onChange={(e) => onChangeBlendshape('blinkAU45', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Ocular Gaze X & Y */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Gaze X</span>
                <span className="font-mono text-sky-400">{blendshapes.gazeX.toFixed(2)}</span>
              </div>
              <input
                id="slider-gaze-x"
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={blendshapes.gazeX}
                onChange={(e) => onChangeBlendshape('gazeX', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Gaze Y</span>
                <span className="font-mono text-sky-400">{blendshapes.gazeY.toFixed(2)}</span>
              </div>
              <input
                id="slider-gaze-y"
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={blendshapes.gazeY}
                onChange={(e) => onChangeBlendshape('gazeY', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
