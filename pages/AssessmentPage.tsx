
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PoseAssessment from '../components/PoseAssessment';
import ReactionTest from '../components/ReactionTest';
import { DrillType } from '../types';
import { dbService } from '../services/dbService';

const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'selection' | 'active' | 'results'>('selection');
  const [selectedDrill, setSelectedDrill] = useState<DrillType | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [isNewPB, setIsNewPB] = useState<boolean>(false);

  // Check if a drill was suggested via navigation state
  useEffect(() => {
    const state = location.state as { autoDrill?: DrillType };
    if (state?.autoDrill) {
      setSelectedDrill(state.autoDrill);
      setStep('active');
    }
  }, [location]);

  const drills = [
    { type: DrillType.PushUps, desc: 'Upper body strength and form.', icon: '💪', category: 'Strength' },
    { type: DrillType.Squats, desc: 'Lower body power and depth.', icon: '🦵', category: 'Strength' },
    { type: DrillType.ReverseLunges, desc: 'Step back to test leg stability.', icon: '🚶', category: 'Strength' },
    { type: DrillType.PlankHold, desc: 'Core stability and endurance.', icon: '🧘', category: 'Core' },
    { type: DrillType.HighKnees, desc: 'Explosive speed and hip mobility.', icon: '🏃', category: 'Agility' },
    { type: DrillType.JumpingJacks, desc: 'Full body coordination and cardio.', icon: '✨', category: 'Cardio' },
    { type: DrillType.Balance, desc: 'Single leg stability test.', icon: '⚖️', category: 'Balance' },
    { type: DrillType.BicepCurls, desc: 'Isolated arm strength.', icon: '🏋️', category: 'Strength' },
    { type: DrillType.ReactionTime, desc: 'Visual reflex speed test.', icon: '⚡', category: 'Reflex' },
  ];

  const handleDrillSelect = (type: DrillType) => {
    setSelectedDrill(type);
    setStep('active');
  };

  const onAssessmentComplete = (score: number) => {
    setFinalScore(score);
    
    if (selectedDrill) {
      const previousPB = dbService.getPersonalBest(selectedDrill);
      if (previousPB === null) {
        setIsNewPB(score > 0);
      } else {
        if (selectedDrill === DrillType.ReactionTime) {
          setIsNewPB(score < previousPB);
        } else {
          setIsNewPB(score > previousPB);
        }
      }
    }
    
    setStep('results');
  };

  const saveResults = () => {
    if (!selectedDrill) return;
    dbService.addAssessment({
      drill: selectedDrill,
      score: finalScore,
      unit: selectedDrill === DrillType.ReactionTime ? 'ms' : (selectedDrill === DrillType.PlankHold || selectedDrill === DrillType.Balance ? 'sec' : 'Reps')
    });
    navigate('/');
  };

  if (step === 'selection') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Select Assessment</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Choose a drill to evaluate your performance. Ensure you have enough space and good lighting.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drills.map((d) => (
            <div 
              key={d.type}
              onClick={() => handleDrillSelect(d.type)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:bg-emerald-50 transition-colors">
                {d.icon}
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">{d.category}</span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{d.type}</h3>
              <p className="text-slate-500 text-sm">{d.desc}</p>
              
              {/* Personal Best indicator on selection card */}
              {dbService.getPersonalBest(d.type) !== null && (
                <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Best: {dbService.getPersonalBest(d.type)} {d.type === DrillType.ReactionTime ? 'ms' : (d.type === DrillType.PlankHold || d.type === DrillType.Balance ? 'sec' : 'Reps')}
                </div>
              )}

              <div className="mt-6 w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Start Test
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'active') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => { setStep('selection'); setSelectedDrill(null); }}
          className="text-slate-500 hover:text-slate-800 mb-6 flex items-center font-bold text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Change Drill
        </button>
        {selectedDrill === DrillType.ReactionTime ? (
          <ReactionTest onComplete={onAssessmentComplete} />
        ) : (
          <PoseAssessment 
            drill={selectedDrill as any} 
            onComplete={onAssessmentComplete} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="bg-white p-12 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-50 relative overflow-hidden">
        {isNewPB && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-10 py-2 rotate-45 translate-x-10 translate-y-6 font-black text-xs uppercase tracking-[0.2em] shadow-lg">
            New Record
          </div>
        )}
        
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-colors ${isNewPB ? 'bg-yellow-100' : 'bg-emerald-100'}`}>
          <span className="text-5xl">{isNewPB ? '⭐' : '🏆'}</span>
        </div>

        {isNewPB && (
          <div className="mb-4 inline-flex items-center px-4 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-black uppercase tracking-widest animate-pulse">
            {selectedDrill === DrillType.ReactionTime ? '⚡ Lightning Reflexes!' : '🔥 Personal Best Smashed!'}
          </div>
        )}

        <h2 className="text-4xl font-black text-slate-800 mb-2">
          {isNewPB ? 'Unstoppable!' : 'Well Done!'}
        </h2>
        <p className="text-slate-500 mb-10">Assessment for <strong>{selectedDrill}</strong> is complete.</p>
        
        <div className={`rounded-[2rem] p-10 mb-10 border transition-all ${isNewPB ? 'bg-slate-900 border-slate-800 text-white shadow-2xl scale-105' : 'bg-slate-50 border-slate-100'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isNewPB ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isNewPB ? 'NEW PERSONAL BEST' : 'SESSION SCORE'}
          </p>
          <div className={`text-8xl font-black tabular-nums tracking-tighter ${isNewPB ? 'text-white' : 'text-emerald-600'}`}>
            {finalScore} 
            <span className={`text-2xl ml-2 uppercase font-bold ${isNewPB ? 'text-slate-400' : 'text-slate-300'}`}>
              {selectedDrill === DrillType.ReactionTime ? 'ms' : (selectedDrill === DrillType.PlankHold || selectedDrill === DrillType.Balance ? 'sec' : 'Reps')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <button 
            onClick={saveResults}
            className="bg-emerald-600 text-white py-5 rounded-2xl font-black hover:bg-emerald-700 transition shadow-xl shadow-emerald-200/50"
          >
            Save Result
          </button>
          <button 
            onClick={() => {
              setStep('selection');
              setIsNewPB(false);
              setSelectedDrill(null);
            }}
            className="bg-slate-100 text-slate-700 py-5 rounded-2xl font-black hover:bg-slate-200 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
