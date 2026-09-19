import React, { useState } from 'react';
import { DeepLearningConfig, HumanoidSequence } from '../types';
import { BENCHMARK_PRESETS } from '../data/presets';
import { Sparkles, Brain, Cpu, Wand2, Compass, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  currentSequence: HumanoidSequence;
  onSelectSequence: (seq: HumanoidSequence) => void;
  onGenerateCustom: (prompt: string, emotion: string, style: string, config: DeepLearningConfig) => Promise<void>;
  isGenerating: boolean;
}

export const DeepLearningStudio: React.FC<Props> = ({
  currentSequence,
  onSelectSequence,
  onGenerateCustom,
  isGenerating,
}) => {
  const [prompt, setPrompt] = useState('Confident technical presentation with expressive hand gestures, natural eye contact, and warm smiling explanations.');
  const [emotion, setEmotion] = useState('Engaged & Warm');
  const [style, setStyle] = useState('Naturalistic Interaction');
  const [config, setConfig] = useState<DeepLearningConfig>({
    architecture: 'MDM + FaceDiff',
    diffusionSteps: 50,
    guidanceScale: 7.5,
    physicsLossWeight: 1.25,
    facsSmoothness: 0.85,
    emotionValence: 0.6,
    emotionArousal: 0.4,
  });

  const [activeTab, setActiveTab] = useState<'presets' | 'generate' | 'hyperparams'>('presets');

  const presetPrompts = [
    'Subtle conversational weight shift with open palm gestures and empathetic head tilt',
    'Athletic balanced bipedal stride with forward gaze locking and arm swing',
    'Sudden perturbation push with reactive ankle compensation and dynamic step balance',
    'Thoughtful listening nod with gentle brow movement and natural micro-blinks',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    await onGenerateCustom(prompt, emotion, style, config);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Deep Learning Synthesis</h2>
            <p className="text-xs text-slate-400">Diffusion & Transformer Kinematic Models</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            id="tab-presets-btn"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'presets' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Benchmarks
          </button>
          <button
            id="tab-generate-btn"
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'generate' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Generator
          </button>
          <button
            id="tab-hyperparams-btn"
            onClick={() => setActiveTab('hyperparams')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === 'hyperparams' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Priors & Loss
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* TAB 1: Benchmark Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Biomechanically Validated Benchmark Sequences</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {BENCHMARK_PRESETS.map((preset) => {
                const isSelected = currentSequence.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`preset-${preset.id}`}
                    onClick={() => onSelectSequence(preset)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500/60 ring-1 ring-sky-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200">{preset.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{preset.description}</p>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700 ml-2 whitespace-nowrap">
                        {preset.duration}s
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Cpu className="w-3 h-3 text-slate-400" />
                        <span>{preset.architecture}</span>
                      </span>
                      <span className="text-emerald-400 font-mono font-medium">
                        {preset.validityMetrics.overallValidityIndex.toFixed(1)}% Valid
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Custom Deep Learning Generator */}
        {activeTab === 'generate' && (
          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kinematic & Semantic Prompt
              </label>
              <textarea
                id="generation-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe desired movement dynamics and facial expression..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none"
              />
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Recommended Prompt Patterns:</span>
              <div className="flex flex-wrap gap-1.5">
                {presetPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-[10px] px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-left"
                  >
                    {p.length > 40 ? p.substring(0, 40) + '...' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Emotion & Style Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Affective Expression
                </label>
                <select
                  id="generation-emotion-select"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Engaged & Warm">Engaged & Warm (AU12+AU6)</option>
                  <option value="Focused & Purposeful">Focused & Purposeful (AU4+AU26)</option>
                  <option value="Compassionate & Receptive">Compassionate & Receptive (AU1+AU2)</option>
                  <option value="Alert & Reactive">Alert & Reactive (AU1+AU25)</option>
                  <option value="Thoughtful & Analytical">Thoughtful & Analytical</option>
                  <option value="Joyful & Inspiring">Joyful & Inspiring</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Motion Style
                </label>
                <select
                  id="generation-style-select"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="Naturalistic Interaction">Naturalistic Interaction</option>
                  <option value="Athletic Locomotion">Athletic Locomotion</option>
                  <option value="Biomechanical Stress Test">Biomechanical Stress Test</option>
                  <option value="Formal Keynote">Formal Keynote</option>
                  <option value="Casual Dialogue">Casual Dialogue</option>
                </select>
              </div>
            </div>

            {/* Valence / Arousal Slider */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Valence (Positivity):</span>
                <span className="font-mono text-sky-400">{config.emotionValence > 0 ? `+${config.emotionValence}` : config.emotionValence}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={config.emotionValence}
                onChange={(e) => setConfig((c) => ({ ...c, emotionValence: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-500"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Arousal (Energy):</span>
                <span className="font-mono text-sky-400">+{config.emotionArousal}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.emotionArousal}
                onChange={(e) => setConfig((c) => ({ ...c, emotionArousal: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-500"
              />
            </div>

            {/* Generate Button */}
            <button
              id="submit-generate-vhh-btn"
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Synthesizing Kinematics & Facial FACS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Valid Humanoid VHH</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: Deep Learning Hyperparameters & Physics Priors */}
        {activeTab === 'hyperparams' && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Generative Backbone Architecture
              </label>
              <select
                id="model-architecture-select"
                value={config.architecture}
                onChange={(e) => setConfig((c) => ({ ...c, architecture: e.target.value as any }))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="MDM + FaceDiff">MDM (Motion Diffusion) + FaceDiff</option>
                <option value="VHH-Transformer">VHH-Transformer (Autoregressive Trajectory)</option>
                <option value="PINN-RL Controller">PINN-RL (Physics-Informed Neural Network)</option>
                <option value="Guided Latent Diffusion">Guided Latent Diffusion with ZMP Guard</option>
              </select>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Physics Ground Penalty (λ_phys):</span>
                  <span className="font-mono text-sky-400">{config.physicsLossWeight}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={config.physicsLossWeight}
                  onChange={(e) => setConfig((c) => ({ ...c, physicsLossWeight: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">Penalizes foot-skate and forces center-of-mass support polygon adherence.</span>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">FACS Co-Occurrence Regularizer:</span>
                  <span className="font-mono text-sky-400">{config.facsSmoothness}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.facsSmoothness}
                  onChange={(e) => setConfig((c) => ({ ...c, facsSmoothness: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-500"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">Enforces natural facial muscle synergy (e.g. AU6 + AU12 for authentic smiles).</span>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Diffusion Denoising Steps:</span>
                  <span className="font-mono text-sky-400">{config.diffusionSteps}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={config.diffusionSteps}
                  onChange={(e) => setConfig((c) => ({ ...c, diffusionSteps: parseInt(e.target.value) }))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Classifier-Free Guidance Scale:</span>
                  <span className="font-mono text-sky-400">{config.guidanceScale}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={config.guidanceScale}
                  onChange={(e) => setConfig((c) => ({ ...c, guidanceScale: parseFloat(e.target.value) }))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
