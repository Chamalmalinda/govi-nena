'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { t, lang, toggleLang } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');

  const validatePhone = (number) => {
    const cleaned = number.replace(/\s/g, '');
    return /^(?:0|94|\+94)?(?:7[0-9])\d{7}$/.test(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhone(phone)) {
      setPhoneError(lang === 'si'
        ? 'වලංගු ශ්‍රී ලංකා දුරකථන අංකයක් ඇතුළු කරන්න (07XXXXXXXX)'
        : 'Enter a valid Sri Lanka phone number (07XXXXXXXX)'
      );
      return;
    }

    setPhoneError('');
    setFormError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, district, password })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?registered=true');
      } else {
        setFormError(data.message || (lang === 'si' ? 'ලියාපදිංචි වීම අසාර්ථකයි' : 'Registration failed'));
      }
    } catch {
      setFormError(lang === 'si' ? 'සේවාදායකය සමඟ සම්බන්ධ විය නොහැක' : 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const districts = t.districts;

  const inputStyle = {
    width: '100%', paddingLeft: '40px', paddingRight: '12px',
    paddingTop: '10px', paddingBottom: '10px',
    fontSize: '14px', borderRadius: '12px',
    border: '2px solid rgba(76,175,80,0.3)', color: '#333',
    outline: 'none', boxSizing: 'border-box', background: '#fff'
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
      <div style={{ background: 'linear-gradient(to bottom, #1B5E20, #4CAF50)', padding: '14px 24px 20px', borderRadius: '0 0 28px 28px', textAlign: 'center', color: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '10px' }}>
            <svg width="38" height="38" viewBox="0 0 80 80" fill="none">
              <path d="M40 10C40 10 20 25 20 42C20 54 28 63 40 68C52 63 60 54 60 42C60 25 40 10 40 10Z" fill="white" opacity="0.9"/>
              <circle cx="40" cy="42" r="10" fill="#2E7D32"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>{t.app_name}</h1>
          <p style={{ fontSize: '13px', color: '#FDD835', margin: 0, fontWeight: '600' }}>{t.register_title}</p>
          <p style={{ fontSize: '11px', opacity: 0.85, margin: 0 }}>{t.register_sub}</p>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '18px', marginBottom: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

            {formError && (
              <div style={{ background: '#FFEBEE', border: '1.5px solid #EF5350', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px', color: '#C62828', fontSize: '13px', fontWeight: '500' }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1B5E20', marginBottom: '5px' }}>{t.full_name}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#4CAF50" strokeWidth="2"/>
                      <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'si' ? 'කමල් පෙරේරා' : 'John Perera'}
                    required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#4CAF50'}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1B5E20', marginBottom: '5px' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#4CAF50"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#4CAF50'}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1B5E20', marginBottom: '5px' }}>{t.phone}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14.1 14.5C14.4 14.2 14.8 14.1 15.1 14.3C16.2 14.7 17.4 14.9 18.6 14.9C19.4 14.9 20 15.5 20 16.3V19.4C20 20.2 19.4 20.8 18.6 20.8C10.1 20.8 3.2 13.9 3.2 5.4C3.2 4.6 3.8 4 4.6 4H7.7C8.5 4 9.1 4.6 9.1 5.4C9.1 6.6 9.3 7.8 9.7 8.9C9.9 9.3 9.8 9.7 9.5 10L7.6 11.9L6.6 10.8Z" fill="#4CAF50"/>
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0771234567"
                    required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#4CAF50'}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                  />
                </div>
                {phoneError && (
                  <p style={{ fontSize: '12px', color: '#C62828', margin: '4px 0 0' }}>⚠️ {phoneError}</p>
                )}
              </div>

              {/* District */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1B5E20', marginBottom: '5px' }}>{t.district}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.7 2 6 4.7 6 8C6 12.5 12 22 12 22C12 22 18 12.5 18 8C18 4.7 15.3 2 12 2Z" stroke="#4CAF50" strokeWidth="2"/>
                      <circle cx="12" cy="8" r="2.5" stroke="#4CAF50" strokeWidth="2"/>
                    </svg>
                  </div>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                    style={{ ...inputStyle, paddingRight: '32px', appearance: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#4CAF50'}
                    onBlur={e => e.target.style.borderColor = 'rgba(76,175,80,0.3)'}
                  >
                    <option value="">{t.district_placeholder}</option>
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="#795548" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1B5E20', marginBottom: '5px' }}>{t.password}</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
                    style={{ ...inputStyle, paddingRight: '44px' }}
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
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', fontSize: '15px',
                  fontWeight: '700', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#81C784' : 'linear-gradient(to right, #1B5E20, #4CAF50)',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(46,125,50,0.4)',
                  marginTop: '4px'
                }}
              >
                {loading ? 'Loading...' : t.register_btn}
              </button>

            </form>
          </div>

          {/* Login Link */}
          <div style={{ textAlign: 'center', paddingBottom: '8px' }}>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 6px' }}>{t.has_account}</p>
            <Link href="/login" style={{ fontSize: '14px', fontWeight: '700', color: '#1B5E20', textDecoration: 'none' }}>
              {t.login_link}
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
