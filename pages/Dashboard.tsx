
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dbService, TRAINING_PACKS } from '../services/dbService';
import { User, Assessment, DrillType, TrainingPack } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [streak, setStreak] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [activePackData, setActivePackData] = useState<any>(null);
  const dailyGoal = 2;

  useEffect(() => {
    setUser(dbService.getUser());
    setAssessments(dbService.getAssessments());
    setStreak(dbService.getStreak());
    setDailyProgress(dbService.getDailyProgress());
    setActivePackData(dbService.getActivePack());
  }, []);

  const chartData = assessments.slice(0, 7).reverse().map(a => ({
    date: new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: a.score,
    drill: a.drill
  }));

  const totalReps = assessments
    .filter(a => a.unit === 'Reps')
    .reduce((acc, curr) => acc + curr.score, 0);

  const pbDrills = [DrillType.PushUps, DrillType.Squats, DrillType.ReactionTime];
  const progressPercentage = Math.min((dailyProgress / dailyGoal) * 100, 100);

  // Calculate pack progress
  let currentPackDay = 0;
  let packDrillsToday: DrillType[] = [];
  if (activePackData) {
    const start = new Date(activePackData.startDate);
    const now = new Date();
    currentPackDay = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (currentPackDay > activePackData.pack.durationDays) {
      // Pack finished
      currentPackDay = -1;
    } else {
      packDrillsToday = activePackData.pack.dailyDrills[currentPackDay - 1] || [];
    }
  }

  const handleStartPack = (packId: string) => {
    dbService.startPack(packId);
    setActivePackData(dbService.getActivePack());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Athlete Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Keep pushing, <span className="text-emerald-600 font-bold">{user?.full_name.split(' ')[0]}</span>. Your performance data is looking strong.
          </p>
        </div>
        <Link 
          to="/assessment"
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 inline-flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Drill
        </Link>
      </header>

      {/* Daily Motivation & Goal Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-black uppercase tracking-[0.2em] mb-1">Current Streak</p>
              <h2 className="text-6xl font-black tracking-tighter flex items-center">
                {streak}
                <span className="text-2xl ml-2 font-bold text-orange-200">Days</span>
              </h2>
              <p className="mt-4 text-orange-100 font-medium">
                {streak > 0 
                  ? "You're on fire! Keep it rolling." 
                  : "Start your streak today!"}
              </p>
            </div>
            <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-md group-hover:scale-110 transition-transform">
              <span className="text-5xl">🔥</span>
            </div>
          </div>
          <div className="absolute -left-10 -bottom-10 opacity-10">
             <span className="text-[12rem]">🔥</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Daily Goal</p>
              <h3 className="text-2xl font-black text-slate-800">Complete {dailyGoal} Drills</h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600">{dailyProgress}</span>
              <span className="text-slate-300 font-bold"> / {dailyGoal}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            {dailyProgress >= dailyGoal 
              ? "Goal achieved! Excellent work today." 
              : `Just ${dailyGoal - dailyProgress} more to hit your target!`}
          </p>
        </div>
      </div>

      {/* Active Training Pack Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Training Programs
        </h2>
        
        {activePackData && currentPackDay !== -1 ? (
          <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row gap-10">
              <div className="lg:w-1/2">
                <div className="inline-flex items-center px-4 py-1 rounded-full bg-emerald-800 text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  Day {currentPackDay} of {activePackData.pack.durationDays}
                </div>
                <h3 className="text-4xl font-black mb-2">{activePackData.pack.name}</h3>
                <p className="text-emerald-100/70 mb-8 max-w-md">{activePackData.pack.description}</p>
                
                <div className="w-full bg-emerald-800/50 h-2 rounded-full mb-2">
                  <div 
                    className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(currentPackDay / activePackData.pack.durationDays) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase text-emerald-400">
                  <span>Start</span>
                  <span>Finish</span>
                </div>
              </div>

              <div className="lg:w-1/2 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                <h4 className="text-sm font-black uppercase tracking-widest text-emerald-300 mb-6">Today's Suggestions</h4>
                <div className="space-y-4">
                  {packDrillsToday.map((drill, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-2xl border border-white/5 transition-all group">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-emerald-400 text-emerald-900 flex items-center justify-center font-black mr-4 group-hover:scale-110 transition-transform">
                          {drill.charAt(0)}
                        </div>
                        <span className="font-bold text-lg">{drill}</span>
                      </div>
                      <button 
                        onClick={() => navigate('/assessment', { state: { autoDrill: drill } })}
                        className="bg-white text-emerald-900 px-6 py-2 rounded-xl font-black text-xs uppercase hover:bg-emerald-100 transition shadow-lg"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                  {packDrillsToday.length === 0 && (
                    <p className="text-emerald-100 italic">Rest day! Focus on light stretching and hydration.</p>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => { if(confirm("Are you sure you want to stop this program?")) dbService.quitPack(); setActivePackData(null); }}
              className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TRAINING_PACKS.map(pack => (
              <div key={pack.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:bg-emerald-50 transition-colors">
                    {pack.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{pack.name}</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">{pack.description}</p>
                  <div className="flex items-center space-x-4 mb-8 text-xs font-black uppercase text-slate-400">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {pack.durationDays} Days
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Adaptive
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleStartPack(pack.id)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition shadow-lg"
                >
                  Join Program
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">Performance Trend</h2>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs text-slate-500">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></span> Last 7 sessions
              </span>
            </div>
          </div>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    strokeWidth={3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="w-12 h-12 mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                <p>Complete your first drill to see analytics.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Career Reps</h3>
              <p className="text-5xl font-black mb-4">{totalReps.toLocaleString()}</p>
              <div className="h-1 bg-slate-800 rounded-full w-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%]"></div>
              </div>
              <p className="text-slate-400 text-xs mt-3">65% of your weekly goal reached.</p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
               <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Personal Bests</h3>
            <div className="space-y-4">
              {pbDrills.map(type => {
                const pb = dbService.getPersonalBest(type);
                if (pb === null) return null;
                return (
                  <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center">
                      <span className="mr-3">{type === DrillType.ReactionTime ? '⚡' : '⭐'}</span>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{type}</span>
                    </div>
                    <span className="font-black text-slate-900">{pb}{type === DrillType.ReactionTime ? 'ms' : ''}</span>
                  </div>
                );
              })}
              {pbDrills.every(t => dbService.getPersonalBest(t) === null) && (
                <p className="text-sm text-slate-400 italic">No records yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Session History</h2>
          <button className="text-emerald-600 font-bold text-sm hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">Drill Type</th>
                <th className="px-8 py-4">Result</th>
                <th className="px-8 py-4">Performance</th>
                <th className="px-8 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assessments.length > 0 ? assessments.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 font-bold">
                        {a.drill.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{a.drill}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-emerald-600 font-black text-lg">{a.score}</span>
                    <span className="text-slate-400 text-xs ml-1 font-bold">{a.unit}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center text-emerald-500 text-sm font-bold">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path></svg>
                      Above Avg
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-sm">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-slate-300">
                    <p className="text-lg italic">Your performance record is empty.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
