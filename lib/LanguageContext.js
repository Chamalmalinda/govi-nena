'use client';

import { createContext, useContext, useState } from 'react';

const translations = {
  si: {
    app_name: 'ගොවි නැණ',
    tagline: 'බුද්ධිමත් ගොවිතැන් සහකාර',
    subtitle: 'ඔබේ බෝග සෞඛ්‍ය සහකරුවා',
    subtitle2: 'Powered by AI',
    sign_in: 'පුරනය වන්න',
    sign_in_sub: 'ගිණුමට ප්‍රවේශ වන්න',
    phone: 'දුරකථන අංකය',
    password: 'මුරපදය',
    forgot: 'මුරපදය අමතකද?',
    login_btn: 'පුරනය වන්න',
    no_account: 'ගිණුමක් නැද්ද?',
    register_link: 'ලියාපදිංචි වන්න',
    footer: '🌾 Empowering Sri Lankan Farmers',
    register_title: 'ලියාපදිංචි වන්න',
    register_sub: 'නව ගිණුමක් සාදන්න',
    full_name: 'සම්පූර්ණ නම',
    district: 'දිස්ත්‍රික්කය',
    district_placeholder: 'දිස්ත්‍රික්කය තෝරන්න',
    register_btn: 'ගිණුම සාදන්න',
    has_account: 'දැනටමත් ගිණුමක් ඇද්ද?',
    login_link: 'පුරනය වන්න',
    districts: [
      'කොළඹ', 'ගම්පහ', 'කළුතර', 'කඳි', 'මාතලේ', 'නුවරඑළිය',
      'ගාල්ල', 'මාතර', 'හම්බන්තොට', 'යාපනය', 'මන්නාරම', 'වවුනියාව',
      'අනුරාධපුර', 'පොළොන්නරුව', 'කුරුණෑගල', 'පුත්තලම', 'බදුල්ල',
      'මොණරාගල', 'රත්නපුර', 'කෑගල්ල', 'ත්‍රිකුණාමලය', 'මඩකළපුව', 'අම්පාර'
    ],
  },
  en: {
    app_name: 'Govi Nena',
    tagline: 'Smart Farming Assistant',
    subtitle: 'Your Crop Health Assistant',
    subtitle2: 'Powered by AI',
    sign_in: 'Sign In',
    sign_in_sub: 'Access your account',
    phone: 'Phone Number',
    password: 'Password',
    forgot: 'Forgot Password?',
    login_btn: 'Sign In',
    no_account: "Don't have an account?",
    register_link: 'Register',
    footer: '🌾 Empowering Sri Lankan Farmers',
    register_title: 'Register',
    register_sub: 'Create your account',
    full_name: 'Full Name',
    district: 'District',
    district_placeholder: 'Select your district',
    register_btn: 'Create Account',
    has_account: 'Already have an account?',
    login_link: 'Sign In',
    districts: [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Mannar', 'Vavuniya',
      'Anuradhapura', 'Polonnaruwa', 'Kurunegala', 'Puttalam', 'Badulla',
      'Monaragala', 'Ratnapura', 'Kegalle', 'Trincomalee', 'Batticaloa', 'Ampara'
    ],
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('si');
  const toggleLang = () => setLang(prev => prev === 'si' ? 'en' : 'si');

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}