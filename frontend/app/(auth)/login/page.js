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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('govi_nena_token', data.token);
        localStorage.setItem('govi_nena_user', JSON.stringify(data.user));
        router.push('/home');
      } else {
        setLoginError(data.message || (lang === 'si' ? 'දුරකථන අංකය හෝ මුරපදය වැරදියි' : 'Invalid phone number or password'));
      }
    } catch {
      setLoginError(lang === 'si' ? 'සේවාදායකය සමඟ සම්බන්ධ විය නොහැක' : 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F9FBF7', fontFamily: 'system-ui, sans-serif' }}>

      {/* Language Toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
        <button
          onClick={toggleLang}
          style={{
            width: '72px', height: '32px', borderRadius: '16px',
            background: lang === 'si' ? '#4CAF50' : '#888',
            position: 'relative', border: 'none', cursor: 'pointer',
            transition: 'background 0.3s',
          }}
        >
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%', background: '#fff',
            position: 'absolute', top: '3px',
            left: lang === 'si' ? '3px' : '43px',
            transition: 'left 0.3s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
          }} />
          <span style={{
            position: 'absolute', fontSize: '10px', fontWeight: '700', color: '#fff',
            left: lang === 'si' ? '33px' : '8px',
            top: '7px', transition: 'left 0.3s', userSelect: 'none'
          }}>
            {lang === 'si' ? 'සිං' : 'EN'}
          </span>
        </button>
      </div>

      {/* Header */}
      <div style={{ background: 'linear-gradient(to bottom, #1B5E20, #4CAF50)', padding: '16px 24px 24px', borderRadius: '0 0 28px 28px', textAlign: 'center', color: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '12px' }}>
            <svg width="44" height="44" viewBox="0 0 80 80" fill="none">
              <path d="M40 10C40 10 20 25 20 42C20 54 28 63 40 68C52 63 60 54 60 42C60 25 40 10 40 10Z" fill="white" opacity="0.9"/>
              <circle cx="40" cy="42" r="10" fill="#2E7D32"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', margin: 0 }}>{t.app_name}</h1>
          <p style={{ fontSize: '14px', color: '#FDD835', margin: 0, fontWeight: '600' }}>{t.tagline}</p>
          <p style={{ fontSize: '12px', opacity: 0.85, margin: 0 }}>{t.subtitle}</p>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', marginBottom: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', textAlign: 'center', color: '#1B5E20', margin: '0 0 2px' }}>{t.sign_in}</h2>
            <p style={{ fontSize: '12px', textAlign: 'center', color: '#795548', margin: '0 0 16px' }}>{t.sign_in_sub}</p>

            {registered && (
              <div style={{ background: '#E8F5E9', border: '1.5px solid #4CAF50', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', color: '#2E7D32', fontSize: '13px', fontWeight: '500' }}>
                ✅ {lang === 'si' ? 'ලියාපදිංචි වීම සාර්ථකයි! කරුණාකර ලොග් වන්න.' : 'Registration successful! Please log in.'}
              </div>
            )}

            {loginError && (
              <div style={{ background: '#FFEBEE', border: '1.5px solid #EF5350', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', color: '#C62828', fontSize: '13px', fontWeight: '500' }}>
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1B5E20', marginBottom: '6px' }}>{t.phone}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14.1 14.5C14.4 14.2 14.8 14.1 15.1 14.3C16.2 14.7 17.4 14.9 18.6 14.9C19.4 14.9 20 15.5 20 16.3V19.4C20 20.2 19.4 20.8 18.6 20.8C10.1 20.8 3.2 13.9 3.2 5.4C3.2 4.6 3.8 4 4.6 4H7.7C8.5 4 9.1 4.6 9.1 5.4C9.1 6.6 9.3 7.8 9.7 8.9C9.9 9.3 9.8 9.7 9.5 10L7.6 11.9L6.6 10.8Z" fill="#4CAF50"/>
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0771234567"
                    required
                    style={{ width: '100%', paddingLeft: '40px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', fontSize: '14px', borderRadius: '12px', border: '2px solid rgba(76,175,80,0.3)', color: '#333', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#4CAF50'}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1B5E20', marginBottom: '6px' }}>{t.password}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                    style={{ width: '100%', paddingLeft: '40px', paddingRight: '44px', paddingTop: '10px', paddingBottom: '10px', fontSize: '14px', borderRadius: '12px', border: '2px solid rgba(76,175,80,0.3)', color: '#333', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#4CAF50'}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12C1.92 9.88 3.38 8.06 5.19 6.69M9.9 4.24A9.12 9.12 0 0112 4C17 4 21.27 7.61 23 12C22.18 14.01 20.83 15.75 19.09 17.08M3 3L21 21" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12C2.73 7.61 7 4 12 4C17 4 21.27 7.61 23 12C21.27 16.39 17 20 12 20C7 20 2.73 16.39 1 12Z" stroke="#795548" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="#795548" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: '4px' }}>
                  <button type="button" style={{ fontSize: '12px', color: '#4CAF50', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {t.forgot}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', fontSize: '15px',
                  fontWeight: '700', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#81C784' : 'linear-gradient(to right, #1B5E20, #4CAF50)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(46,125,50,0.4)'
                }}
              >
                {loading ? 'Loading...' : t.login_btn}
              </button>

            </form>
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', paddingBottom: '8px' }}>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px' }}>{t.no_account}</p>
            <Link href="/register" style={{ fontSize: '14px', fontWeight: '700', color: '#1B5E20', textDecoration: 'none' }}>
              {t.register_link}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 24px', textAlign: 'center', background: '#E8F5E9' }}>
        <p style={{ fontSize: '12px', color: '#558B2F', margin: 0 }}>{t.footer}</p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FBF7' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #4CAF50', borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
