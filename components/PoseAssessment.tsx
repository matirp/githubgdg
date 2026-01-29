import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getCoachingFeedback, speakText } from '../services/geminiService';
import { DrillType } from '../types';

interface Props {
  drill: DrillType;
  onComplete: (score: number) => void;
}

const PoseAssessment: React.FC<Props> = ({ drill, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [feedback, setFeedback] = useState('Positioning camera...');
  const [isInitializing, setIsInitializing] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  
  const stateRef = useRef({
    count: 0,
    startTime: 0,
    isActive: false,
    stage: 'none',
    minElbowAngle: 180,
    minKneeAngle: 180,
    lastKneeHigh: 'none',
    isFeedbackLoading: false,
    lastPoseResults: null as any,
    sessionMetrics: {
      minElbowAngle: 180,
      minKneeAngle: 180,
      hipAngle: 180,
      stability: 100
    }
  });

  const getInstructions = (type: DrillType) => {
    switch (type) {
      case DrillType.PushUps: return "Push-ups: Step back. Both elbows must reach 90 degrees.";
      case DrillType.Squats: return "Squats: Feet shoulder-width. Thighs parallel to floor.";
      case DrillType.ReverseLunges: return "Reverse Lunges: Step back, lower knee. Keep front leg stable.";
      case DrillType.PlankHold: return "Plank: Straight line from head to heels.";
      case DrillType.HighKnees: return "High Knees: Lift knees above waist quickly.";
      case DrillType.JumpingJacks: return "Jumping Jacks: Feet wide, clap above head.";
      case DrillType.Balance: return "Balance: Lift one foot, hold torso still.";
      case DrillType.BicepCurls: return "Bicep Curls: Keep elbows at your sides and face the camera.";
      default: return "Ready? Let's begin.";
    }
  };

  useEffect(() => {
    const text = getInstructions(drill);
    setFeedback(text);
    speakText(text);
    stateRef.current.startTime = Date.now();
  }, [drill]);

  const calculateAngle = (a: any, b: any, c: any) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const triggerPeriodicFeedback = useCallback(async () => {
    if (stateRef.current.isFeedbackLoading || isInitializing) return;
    
    stateRef.current.isFeedbackLoading = true;
    const metrics = {
      ...stateRef.current.sessionMetrics,
      count: stateRef.current.count
    };

    const coachingText = await getCoachingFeedback(drill, metrics);
    setFeedback(coachingText);
    speakText(coachingText);
    
    setTimeout(() => {
      stateRef.current.isFeedbackLoading = false;
    }, 8000);
  }, [drill, isInitializing]);

  useEffect(() => {
    const interval = setInterval(triggerPeriodicFeedback, 8000);
    return () => clearInterval(interval);
  }, [triggerPeriodicFeedback]);

  const onResults = useCallback((results: any) => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    if (isInitializing) setIsInitializing(false);
    stateRef.current.lastPoseResults = results.poseLandmarks;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.poseLandmarks) {
      const lm = results.poseLandmarks;
      let currentWarning: string | null = null;
      const isVisible = (indices: number[]) => indices.every(i => lm[i] && lm[i].visibility > 0.5);

      if (drill === DrillType.PushUps) {
        if (isVisible([11, 12, 13, 14, 15, 16, 23, 24])) {
          const lAngle = calculateAngle(lm[11], lm[13], lm[15]);
          const rAngle = calculateAngle(lm[12], lm[14], lm[16]);
          const hipAngle = calculateAngle(lm[12], lm[24], lm[28]);
          stateRef.current.sessionMetrics.hipAngle = hipAngle;
          if (hipAngle < 150 || hipAngle > 210) {
            currentWarning = "Keep back straight!";
          } else {
            if (lAngle < 100 && rAngle < 100) {
              stateRef.current.stage = 'down';
              stateRef.current.sessionMetrics.minElbowAngle = Math.min(stateRef.current.sessionMetrics.minElbowAngle, (lAngle + rAngle) / 2);
            }
            if (lAngle > 155 && rAngle > 155 && stateRef.current.stage === 'down') {
              stateRef.current.stage = 'up';
              stateRef.current.count++;
              setCount(stateRef.current.count);
            }
          }
        } else currentWarning = "Step back for full view";
      }
      else if (drill === DrillType.Squats) {
        if (isVisible([23, 24, 25, 26, 27, 28])) {
          const lKnee = calculateAngle(lm[23], lm[25], lm[27]);
          const rKnee = calculateAngle(lm[24], lm[26], lm[28]);
          if ((lKnee < 110 && rKnee > 150) || (rKnee < 110 && lKnee > 150)) {
            currentWarning = "Bend both legs equally!";
          } else {
            if (lKnee < 105 && rKnee < 105) {
              stateRef.current.stage = 'down';
              stateRef.current.sessionMetrics.minKneeAngle = Math.min(stateRef.current.sessionMetrics.minKneeAngle, (lKnee + rKnee) / 2);
            }
            if (lKnee > 160 && rKnee > 160 && stateRef.current.stage === 'down') {
              stateRef.current.stage = 'up';
              stateRef.current.count++;
              setCount(stateRef.current.count);
            }
          }
        } else currentWarning = "Legs not fully visible";
      }
      else if (drill === DrillType.BicepCurls) {
        // More lenient visibility for bicep curls (shoulder-elbow-wrist on at least one side)
        const leftVisible = isVisible([11, 13, 15]);
        const rightVisible = isVisible([12, 14, 16]);
        
        if (leftVisible || rightVisible) {
          const lElbow = leftVisible ? calculateAngle(lm[11], lm[13], lm[15]) : 180;
          const rElbow = rightVisible ? calculateAngle(lm[12], lm[14], lm[16]) : 180;
          
          const activeAngle = Math.min(lElbow, rElbow);
          
          if (activeAngle < 45) {
            stateRef.current.stage = 'up';
          }
          if (activeAngle > 150 && stateRef.current.stage === 'up') {
            stateRef.current.stage = 'down';
            stateRef.current.count++;
            setCount(stateRef.current.count);
          }
        } else currentWarning = "Ensure arms are visible";
      }
      else if (drill === DrillType.HighKnees) {
        if (isVisible([23, 24, 25, 26])) {
          const hipY = (lm[23].y + lm[24].y) / 2;
          if (lm[25].y < hipY - 0.05 && stateRef.current.lastKneeHigh !== 'left') {
            stateRef.current.lastKneeHigh = 'left';
            stateRef.current.count++;
            setCount(stateRef.current.count);
          } else if (lm[26].y < hipY - 0.05 && stateRef.current.lastKneeHigh !== 'right') {
            stateRef.current.lastKneeHigh = 'right';
            stateRef.current.count++;
            setCount(stateRef.current.count);
          }
        } else currentWarning = "Hips/knees not visible";
      }
      else if (drill === DrillType.PlankHold) {
        if (isVisible([11, 23, 27])) {
          const bodyAngle = calculateAngle(lm[11], lm[23], lm[27]);
          if (bodyAngle < 165 || bodyAngle > 195) {
            currentWarning = "Straighten your back!";
          } else {
            const elapsed = Math.floor((Date.now() - stateRef.current.startTime) / 1000);
            stateRef.current.count = elapsed;
            setCount(elapsed);
          }
        } else currentWarning = "Side view required";
      }
      else if (drill === DrillType.Balance) {
        if (isVisible([27, 28, 23, 24])) {
          if (Math.abs(lm[27].y - lm[28].y) < 0.1) {
            currentWarning = "Lift foot higher!";
          } else {
            const elapsed = Math.floor((Date.now() - stateRef.current.startTime) / 1000);
            stateRef.current.count = elapsed;
            setCount(elapsed);
          }
        } else currentWarning = "Legs not visible";
      }
      else if (drill === DrillType.JumpingJacks) {
        if (isVisible([15, 16, 27, 28])) {
          if (Math.min(lm[15].y, lm[16].y) < lm[0].y && Math.abs(lm[27].x - lm[28].x) > 0.3) {
            if (stateRef.current.stage !== 'out') {
              stateRef.current.stage = 'out';
              stateRef.current.count++;
              setCount(stateRef.current.count);
            }
          } else if (Math.min(lm[15].y, lm[16].y) > lm[11].y && Math.abs(lm[27].x - lm[28].x) < 0.2) {
            stateRef.current.stage = 'in';
          }
        } else currentWarning = "Step back for full view";
      }

      setWarning(currentWarning);
      // @ts-ignore
      window.drawConnectors(canvasCtx, lm, window.POSE_CONNECTIONS, { color: currentWarning ? '#ef4444' : '#10b981', lineWidth: 3 });
      // @ts-ignore
      window.drawLandmarks(canvasCtx, lm, { color: '#ffffff', lineWidth: 0.5, radius: 2 });
    }
    canvasCtx.restore();
  }, [drill, isInitializing]);

  useEffect(() => {
    let camera: any = null;
    let isLive = true;

    const pose = new (window as any).Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5 
    });

    pose.onResults((results: any) => {
      if (!isLive) return;
      onResults(results);
    });

    if (videoRef.current) {
      camera = new (window as any).Camera(videoRef.current, {
        onFrame: async () => {
          if (!isLive || !videoRef.current) return;
          try {
            await pose.send({ image: videoRef.current });
          } catch (err) {
            console.error("Pose processing error:", err);
          }
        },
        width: 1280, height: 720
      });
      camera.start();
    }

    return () => {
      isLive = false;
      if (camera) {
        camera.stop();
      }
      // Ensure pose.close() is called to free Wasm memory
      // The isLive flag prevents late frames from reaching it
      pose.close();
    };
  }, [onResults]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{drill}</h2>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${warning ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {warning ? 'Form Warning' : 'Tracking'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => onComplete(count)}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-emerald-600 transition shadow-md"
          >
            Finish
          </button>
        </div>

        <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-inner ring-4 ring-slate-50">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas ref={canvasRef} className="w-full h-full object-cover" width={1280} height={720} />
          
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-30">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-black tracking-widest uppercase text-[10px]">Loading Vision AI...</p>
              </div>
            </div>
          )}

          {/* Warning Overlay: Compact */}
          {warning && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
              <div className="bg-red-600/90 text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl flex items-center border border-white/20">
                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                {warning}
              </div>
            </div>
          )}

          {/* Score: Smaller, elegant box */}
          <div className="absolute top-4 right-4 z-40">
            <div className="bg-white/90 backdrop-blur-md min-w-[80px] py-3 rounded-2xl shadow-xl border border-white flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                {drill === DrillType.PlankHold || drill === DrillType.Balance ? 'SEC' : 'REPS'}
              </span>
              <span className="text-4xl font-black text-slate-900 tabular-nums">{count}</span>
            </div>
          </div>

          {/* Coaching Panel: Concise & Slimmed Down */}
          <div className="absolute bottom-4 left-4 right-4 z-40">
            <div className="bg-white/80 backdrop-blur-lg p-3 px-5 rounded-2xl shadow-xl border border-white/50 flex items-center space-x-3 max-w-lg mx-auto">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Coach</p>
                <p className="text-slate-800 font-bold text-sm truncate">{feedback}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseAssessment;