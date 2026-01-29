import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const Header: React.FC = () => {
  const location = useLocation();
  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Assessment', path: '/assessment' },
    { name: 'Profile', path: '/profile' }
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-black text-emerald-600 tracking-tighter">TalentAI</Link>
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-baseline space-x-4 mr-4 border-r border-slate-100 pr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === link.path 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;