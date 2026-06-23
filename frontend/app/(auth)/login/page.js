'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLang } from '@/lib/LanguageContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang, toggleLang } = useLang();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const registered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save session credentials
        localStorage.setItem('govi_nena_token', data.token);
        localStorage.setItem('govi_nena_user', JSON.stringify(data.user));
        
        // Redirect to homepage
        router.push('/home');
      } else {
        setLoginError(data.message || (lang === 'si' ? 'දුරකථන අංකය හෝ මුරපදය වැරදියි' : 'Invalid phone number or password'));
      }
    } catch (error) {
      setLoginError(lang === 'si' ? 'සේවාදායකය සමඟ සම්බන්ධ විය නොහැක' : 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9FBF7' }}>

      {/* Language Toggle */}
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={toggleLang}
          className="relative flex items-center transition-all"
          style={{
            width: '80px',
            height: '36px',
            borderRadius: '18px',
            background: lang === 'si' ? '#4CAF50' : '#ccc',
            padding: '3px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
        >
          {/* Sliding dot */}
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            position: 'absolute',
            left: lang === 'si' ? '4px' : '46px',
            transition: 'left 0.3s',
          }}/>
          {/* Labels */}
          <span style={{
            position: 'absolute',
            left: lang === 'si' ? '38px' : '10px',
            fontSize: '11px',
            fontWeight: '700',
            color: '#fff',
            transition: 'left 0.3s',
            userSelect: 'none',
          }}>
            {lang === 'si' ? 'සිං' : 'EN'}
          </span>
        </button>
      </div>

      {/* Header */}
      <div className="px-6 pt-10 pb-12 rounded-b-[3rem] text-white text-center"
        style={{ background: 'linear-gradient(to bottom, #1B5E20, #4CAF50)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path d="M40 10C40 10 20 25 20 42C20 54 28 63 40 68C52 63 60 54 60 42C60 25 40 10 40 10Z" fill="white" opacity="0.9"/>
              <circle cx="40" cy="42" r="10" fill="#2E7D32"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold">{t.app_name}</h1>
          <p className="text-3xl" style={{ color: '#FDD835' }}>{t.tagline}</p>
          <p className="text-xl opacity-90">{t.subtitle}</p>
          <p className="text-lg opacity-80">{t.subtitle2}</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-8 mb-6" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h2 className="text-3xl text-center font-semibold mb-1" style={{ color: '#1B5E20' }}>
              {t.sign_in}
            </h2>
            <p className="text-xl text-center mb-8" style={{ color: '#795548' }}>{t.sign_in_sub}</p>

            {registered && (
              <div style={{
                background: '#E8F5E9',
                border: '1.5px solid #4CAF50',
                borderRadius: '16px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#2E7D32',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ✅ {lang === 'si' ? 'ලියාපදිංචි වීම සාර්ථකයි! කරුණාකර ලොග් වන්න.' : 'Registration successful! Please log in.'}
              </div>
            )}

            {loginError && (
              <div style={{
                background: '#FFEBEE',
                border: '1.5px solid #EF5350',
                borderRadius: '16px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#C62828',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Phone */}
              <div>
                <label className="block text-xl mb-3" style={{ color: '#1B5E20' }}>{t.phone}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14.1 14.5C14.4 14.2 14.8 14.1 15.1 14.3C16.2 14.7 17.4 14.9 18.6 14.9C19.4 14.9 20 15.5 20 16.3V19.4C20 20.2 19.4 20.8 18.6 20.8C10.1 20.8 3.2 13.9 3.2 5.4C3.2 4.6 3.8 4 4.6 4H7.7C8.5 4 9.1 4.6 9.1 5.4C9.1 6.6 9.3 7.8 9.7 8.9C9.9 9.3 9.8 9.7 9.5 10L7.6 11.9L6.6 10.8Z" fill="#4CAF50"/>
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0771234567"
                    required
                    className="w-full pl-14 pr-4 py-4 text-xl rounded-2xl outline-none transition-colors"
                    style={{ border: '2px solid rgba(76,175,80,0.3)', color: '#333' }}
                    onFocus={e => e.target.style.borderColor = '#4CAF50'}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xl mb-3" style={{ color: '#1B5E20' }}>{t.password}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#4CAF50" strokeWidth="2"/>
                      <path d="M8 11V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V11" stroke="#4CAF50" strokeWidth="2"/>
                      <circle cx="12" cy="16" r="1.5" fill="#4CAF50"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-14 pr-14 py-4 text-xl rounded-2xl outline-none transition-colors"
                    style={{ border: '2px solid rgba(76,175,80,0.3)', color: '#333' }}
                    onFocus={e => e.target.style.borderColor = '#4CAF50'}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12C1.92 9.88 3.38 8.06 5.19 6.69M9.9 4.24A9.12 9.12 0 0112 4C17 4 21.27 7.61 23 12C22.18 14.01 20.83 15.75 19.09 17.08M3 3L21 21" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12C2.73 7.61 7 4 12 4C17 4 21.27 7.61 23 12C21.27 16.39 17 20 12 20C7 20 2.73 16.39 1 12Z" stroke="#795548" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="#795548" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <button type="button" className="text-lg" style={{ color: '#4CAF50' }}>
                    {t.forgot}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl text-2xl text-white font-semibold transition-shadow"
                style={{
                  background: loading ? '#81C784' : 'linear-gradient(to right, #1B5E20, #4CAF50)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(46,125,50,0.4)'
                }}
              >
                {loading ? 'Loading...' : t.login_btn}
              </button>

            </form>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-xl mb-3" style={{ color: '#666' }}>{t.no_account}</p>
            <Link href="/register" className="text-2xl font-semibold" style={{ color: '#1B5E20' }}>
              {t.register_link}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center" style={{ background: '#E8F5E9' }}>
        <p className="text-lg" style={{ color: '#558B2F' }}>{t.footer}</p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FBF7' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid #4CAF50', borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}