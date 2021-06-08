import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { wait: false, useSuspense: true },
});
