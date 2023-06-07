import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/en';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/nb';
import 'dayjs/locale/ja';
import { enGB, enUS, ja, nb } from 'date-fns/locale';
import i18n from './i18n';

dayjs.extend(localizedFormat);

const LS_KEY = 'chartsLocale';

export const availableLocales = [
  { value: 'en' as const, label: 'English' },
  { value: 'en-gb' as const, label: 'English (United Kingdom)' },
  { value: 'nb' as const, label: 'Norsk Bokmål' },
  { value: 'ja' as const, label: '日本' },
];

export const currentLocale = () =>
  availableLocales.find((l) => l.value === dayjs.locale()) ??
  availableLocales[0];

export const currentDateRangeLocale = () => {
  const list = {
    en: enUS,
    'en-gb': enGB,
    nb,
    ja,
  };
  return list[currentLocale().value];
};

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
