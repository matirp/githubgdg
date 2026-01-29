
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setUser(dbService.getUser());
  }, []);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      dbService.updateUser(user);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Your Profile</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">Full Name</label>
            <input 
              type="text" 
              value={user.full_name} 
              onChange={e => setUser({...user, full_name: e.target.value})}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">Primary Sport</label>
            <input 
              type="text" 
              value={user.sport} 
              onChange={e => setUser({...user, sport: e.target.value})}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">Age</label>
            <input 
              type="number" 
              value={user.age || ''} 
              onChange={e => setUser({...user, age: parseInt(e.target.value) || null})}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">Gender</label>
            <select 
              value={user.gender} 
              onChange={e => setUser({...user, gender: e.target.value})}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">Height (cm)</label>
            <input 
              type="number" 
              value={user.height || ''} 
              onChange={e => setUser({...user, height: parseInt(e.target.value) || null})}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase">Weight (kg)</label>
            <input 
              type="number" 
              value={user.weight || ''} 
              onChange={e => setUser({...user, weight: parseInt(e.target.value) || null})}
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 pt-6">
            <button 
              type="submit" 
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
            >
              Save Profile Changes
            </button>
            {msg && <p className="mt-4 text-emerald-600 font-bold">{msg}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
