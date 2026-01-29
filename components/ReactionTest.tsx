
import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onComplete: (score: number) => void;
}

const ReactionTest: React.FC<Props> = ({ onComplete }) => {
  const [state, setState] = useState<'idle' | 'waiting' | 'ready' | 'too_soon' | 'finished'>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const handleClick = () => {
    if (state === 'idle' || state === 'too_soon') {
      startRound();
    } else if (state === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState('too_soon');
    } else if (state === 'ready') {
      const reactionTime = Date.now() - startTime;
      const newTimes = [...times, reactionTime];
      setTimes(newTimes);
      
      if (newTimes.length >= 5) {
        const avg = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        setState('finished');
        onComplete(Math.round(avg));
      } else {
        startRound();
      }
    }
  };

  const startRound = () => {
    setState('waiting');
    const delay = Math.random() * 2000 + 1000;
    timeoutRef.current = window.setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const getBgColor = () => {
    switch(state) {
      case 'waiting': return 'bg-slate-700';
      case 'ready': return 'bg-green-500';
      case 'too_soon': return 'bg-red-500';
      default: return 'bg-emerald-500';
    }
  };

  const getInstruction = () => {
    switch(state) {
      case 'idle': return 'Click here to start';
      case 'waiting': return 'Wait for Green...';
      case 'ready': return 'CLICK NOW!';
      case 'too_soon': return 'Too soon! Click to try again.';
      case 'finished': return 'Test Complete!';
      default: return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Reaction Time Test</h2>
      <p className="text-slate-600 mb-6">Click the box when it turns green. We'll take 5 samples.</p>
      
      <div 
        onClick={handleClick}
        className={`w-full h-64 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 select-none ${getBgColor()}`}
      >
        <p className="text-3xl font-bold text-white">{getInstruction()}</p>
        {times.length > 0 && state !== 'finished' && (
          <p className="text-xl text-white/80 mt-2">Last: {times[times.length-1]}ms</p>
        )}
      </div>

      <div className="flex justify-around mt-8">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase">Round</p>
          <p className="text-2xl font-bold text-slate-700">{times.length} / 5</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase">Average</p>
          <p className="text-2xl font-bold text-emerald-600">
            {times.length > 0 ? Math.round(times.reduce((a,b)=>a+b, 0) / times.length) : 0} ms
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReactionTest;
