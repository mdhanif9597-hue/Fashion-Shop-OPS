import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldAlert,
  KeyRound,
  LogIn,
  Users,
  CheckCircle2,
  Cloud,
  Copy,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { DEFAULT_USERS } from '../services/firebaseFirestore';

export const UserAuthModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currentUser,
    loginUser,
    logoutUser,
    firebaseStatus,
  } = useShop();

  const isOpen = activeModal === 'user_auth';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const ok = loginUser(username.trim(), password.trim());
    if (ok) {
      setSuccess(`সফলভাবে লগইন হয়েছে: ${username}`);
      setTimeout(() => {
        setActiveModal('none');
      }, 700);
    } else {
      setError('ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়!');
    }
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setError('');
    setUsername(uname);
    setPassword(pass);
    const ok = loginUser(uname, pass);
    if (ok) {
      setSuccess(`সফলভাবে লগইন হয়েছে: ${uname}`);
      setTimeout(() => {
        setActiveModal('none');
      }, 700);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">ইউজার ও অ্যাডমিন একাউন্ট সিস্টেম</h3>
              <p className="text-[11px] text-slate-300">
                ফায়ারবেস ক্লাউড রিয়েল-টাইম ডাটাবেজের সাথে সংযুক্ত
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Active User Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{currentUser.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  ইউজারনেম: <span className="font-mono text-slate-800 font-semibold">{currentUser.username}</span> | {currentUser.designation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <Cloud className="w-3.5 h-3.5" />
                  {firebaseStatus === 'connected' ? 'Firebase Active' : 'Online'}
                </span>
              </div>
              <button
                onClick={logoutUser}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
              >
                লগআউট
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <LogIn className="w-4 h-4 text-emerald-600" />
              লগইন করুন / ইউজার পরিবর্তন করুন
            </h4>

            {error && (
              <div className="p-2.5 bg-rose-100 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইউজার নেম (Username)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or cashier1"
                  required
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                লগইন সম্পন্ন করুন
              </button>
            </div>
          </form>

          {/* User Accounts & Passwords Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                সকল ইউজার ও পাসওয়ার্ড তালিকা (১ অ্যাডমিন + ৫ ইউজার)
              </h4>
              <span className="text-[11px] text-slate-500">যেকোনো একটিতে ক্লিক করে সরাসরি লগইন করুন</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {Object.entries(DEFAULT_USERS).map(([key, item]) => {
                const isAdmin = item.user.role === 'admin';
                const isCurrent = currentUser.username === item.user.username;

                return (
                  <div
                    key={key}
                    className={`p-3 flex items-center justify-between transition ${
                      isCurrent ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                          isAdmin
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isAdmin ? 'A' : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.user.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              isAdmin
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.user.role}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> সক্রিয়
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>User: <strong className="text-slate-800">{item.user.username}</strong></span>
                          <span>Pass: <strong className="text-slate-800">{item.password}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`User: ${item.user.username} | Pass: ${item.password}`, key)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded text-xs transition"
                        title="কপি করুন"
                      >
                        {copiedKey === key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickLogin(item.user.username, item.password)}
                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 rounded-md shadow-2xs transition"
                      >
                        {isCurrent ? 'রিলোড' : 'সুইচ করুন'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Public Server Real-time Notice */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Cloud className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-950 mb-0.5">রিয়েল-টাইম পাবলিক ক্লাউড সিঙ্ক চালু আছে</p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                যে কোনো কাউন্টার বা ইউজার যখন কোনো নতুন প্রোডাক্ট যোগ করবে, বিক্রি করবে বা খরচ লিপিবদ্ধ করবে, তা সাথে সাথে ফায়ারবেস ক্লাউড ডাটাবেজে সংরক্ষণ হবে এবং সবার স্ক্রিনে সাথে সাথে রিয়েল-টাইমে আপডেট দেখাবে।
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setActiveModal('none')}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
