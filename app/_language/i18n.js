import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from '../../locales/en/common.json';
import enIndex from '../../locales/en/index.json';
import enProfile from '../../locales/en/profile.json';
import enReport from '../../locales/en/report.json';
import hiCommon from '../../locales/hi/common.json';
import hiIndex from '../../locales/hi/index.json';
import hiProfile from '../../locales/hi/profile.json';
import hiReport from '../../locales/hi/report.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        index: enIndex,
        profile: enProfile,
        report: enReport.report,
        common: enCommon,
      },
      hi: {
        index: hiIndex,
        profile: hiProfile,
        report: hiReport.report,
        common: hiCommon,
      },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    ns: ['index','profile', 'report'],
    defaultNS: 'index',
    interpolation: {
      escapeValue: false, // React already handles this
    },
  });

export default i18n;
