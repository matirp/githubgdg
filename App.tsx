import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AssessmentPage from './pages/AssessmentPage';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {user && <Header />}
        <main className="flex-grow">
          <Routes>
            {/* If not logged in, only AuthPage is accessible */}
            {!user ? (
              <>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/auth" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/assessment" element={<AssessmentPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </main>
        {user && (
          <footer className="bg-white border-t border-slate-200 py-6">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
              © 2024 TalentAI Athletic Performance Partner. All rights reserved.
            </div>
          </footer>
        )}
      </div>
    </HashRouter>
  );
};

export default App;