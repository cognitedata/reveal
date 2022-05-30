import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/en';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/nb';
import 'dayjs/locale/ja';
import i18n from './i18n';

dayjs.extend(localizedFormat);

const LS_KEY = 'chartsLocale';

export const availableLocales = [
  { value: 'en', label: 'English' },
  { value: 'en-gb', label: 'English (United Kingdom)' },
  { value: 'nb', label: 'Norsk Bokmål' },
  { value: 'ja', label: '日本' },
];

export const currentLocale = () =>
  availableLocales.find((l) => l.value === dayjs.locale()) ??
  availableLocales[0];

export const changeDayJSLocale = (lang: string) => {
  dayjs.locale(lang);
  localStorage.setItem(LS_KEY, lang);
};

(async () => {
  const localLocale = localStorage.getItem(LS_KEY);
  if (localLocale && localLocale !== 'en') {
    // Import locale from localstorage
    changeDayJSLocale(localLocale);
  } else if (i18n.language && i18n.language !== 'en') {
    // Import locale from i18n language
    changeDayJSLocale(i18n.language);
  }
})();
