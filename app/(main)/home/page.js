'use client';

import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/LanguageContext';

export default function HomePage() {
  const { lang, toggleLang } = useLang();
  const router = useRouter();

  const crops = [
    {
      id: 'paddy',
      si: 'සහල්', en: 'Paddy', emoji: '🌾',
      gradient: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
      light: '#E8F5E9'
    },
    {
      id: 'tomato',
      si: 'තක්කාලි', en: 'Tomato', emoji: '🍅',
      gradient: 'linear-gradient(135deg, #B71C1C, #EF5350)',
      light: '#FFEBEE'
    },
    {
      id: 'chili',
      si: 'මිරිස්', en: 'Chili', emoji: '🌶️',
      gradient: 'linear-gradient(135deg, #E65100, #FF9800)',
      light: '#FFF3E0'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F9FBF7' }}>

      {/* Header */}
      <div className="px-6 pt-12 pb-8 rounded-b-3xl text-white"
        style={{ background: '#1B5E20', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>

        {/* Top row - User + Lang toggle + Logout */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="white"/>
                <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-lg opacity-90">{lang === 'si' ? 'ආයුබෝවන්' : 'Welcome'}</p>
              <p className="text-xl font-semibold"></p>
              <p className="text-sm opacity-70"></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
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
              }}/>
              <span style={{
                position: 'absolute', fontSize: '10px', fontWeight: '700', color: '#fff',
                left: lang === 'si' ? '33px' : '8px',
                top: '7px', transition: 'left 0.3s', userSelect: 'none'
              }}>
                {lang === 'si' ? 'සිං' : 'EN'}
              </span>
            </button>
            {/* Logout */}
            <button
              onClick={() => router.push('/login')}
              className="flex items-center justify-center"
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* App title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#4CAF50' }}>
              <svg width="32" height="32" viewBox="0 0 80 80" fill="none">
                <path d="M40 10C40 10 20 25 20 42C20 54 28 63 40 68C52 63 60 54 60 42C60 25 40 10 40 10Z" fill="white" opacity="0.9"/>
                <circle cx="40" cy="42" r="10" fill="#1B5E20"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Govi Nena</h1>
              <p className="text-lg" style={{ color: '#FDD835' }}>ගොවි නැණ</p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Alerts */}
            <button
              onClick={() => router.push('/alerts')}
              style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            {/* Map */}
            <button
              onClick={() => router.push('/heatmap')}
              style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="9" r="3" stroke="white" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        <p className="text-xl opacity-90">{lang === 'si' ? 'ඔබේ බෝග තෝරන්න' : 'Select your crop'}</p>
        <p className="text-base opacity-70">{lang === 'si' ? 'Select your crop' : 'රෝගය හඳුනා ගැනීමට'}</p>
      </div>

      {/* Crop Cards */}
      <div className="flex-1 px-6 py-8 flex flex-col gap-5">
        {crops.map((crop) => (
          <button
            key={crop.id}
            onClick={() => router.push(`/scan?crop=${crop.id}`)}
            className="relative overflow-hidden rounded-3xl text-left transition-all"
            style={{
              background: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              padding: '28px',
              border: '1px solid #f0f0f0'
            }}
          >
            {/* Background gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: crop.gradient,
              opacity: 0.06,
              borderRadius: 24
            }} />
            <div className="relative flex items-center gap-5">
              <div className="text-6xl">{crop.emoji}</div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-1" style={{ color: '#1B5E20' }}>
                  {lang === 'si' ? crop.si : crop.en}
                </h2>
                <p className="text-xl" style={{ color: '#795548' }}>
                  {lang === 'si' ? crop.en : crop.si}
                </p>
              </div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M9 5L16 12L9 19" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center" style={{ background: '#4CAF50' }}>
        <p className="text-white text-lg">{lang === 'si' ? 'රෝග හඳුනාගෙන ප්‍රතිකාර සොයන්න' : 'Identify diseases and find treatments'}</p>
        <p className="text-white opacity-80 text-sm">{lang === 'si' ? 'Identify diseases and find treatments' : 'රෝග හඳුනාගෙන ප්‍රතිකාර සොයන්න'}</p>
      </div>

      {/* Bottom Nav */}
      <div className="flex justify-around items-center px-6 py-4"
        style={{ background: '#fff', borderTop: '1px solid #e0e0e0' }}>
        {[
          { icon: 'M2 9L12 4L22 9V20H15V14H9V20H2V9Z', label: lang === 'si' ? 'මුල' : 'Home', active: true, path: '/home' },
          { icon: 'M12 2C8.686 2 6 4.686 6 8C6 12.5 12 22 12 22C12 22 18 12.5 18 8C18 4.686 15.314 2 12 2ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z', label: lang === 'si' ? 'ස්කෑන්' : 'Scan', active: false, path: '/scan' },
          { icon: 'M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z', label: lang === 'si' ? 'සිතියම' : 'Map', active: false, path: '/heatmap' },
          { icon: 'M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21', label: lang === 'si' ? 'ඇඟවීම්' : 'Alerts', active: false, path: '/alerts' },
        ].map((item, i) => (
          <button key={i} onClick={() => router.push(item.path)}
            className="flex flex-col items-center gap-1">
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: item.active ? '#E8F5E9' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d={item.icon} stroke={item.active ? '#2E7D32' : '#bbb'} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '10px', color: item.active ? '#2E7D32' : '#bbb', fontWeight: item.active ? '600' : '400' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}