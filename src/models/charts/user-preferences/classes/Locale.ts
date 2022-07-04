import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/en';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/nb';
import 'dayjs/locale/ja';
import { enGB, enUS, ja, nb } from 'date-fns/locale';
import Config from 'models/charts/config/classes/Config';
import i18next from 'i18next';

dayjs.extend(localizedFormat);

type AvailableLocales = typeof Locale.options[number]['value'];

export default class Locale {
  static readonly options = [
    { value: 'en' as const, label: 'English' },
    { value: 'en-gb' as const, label: 'English (United Kingdom)' },
    { value: 'nb' as const, label: 'Norsk Bokmål' },
    { value: 'ja' as const, label: '日本' },
  ];

  static readonly dateFnsLocale = {
    en: enUS,
    'en-gb': enGB,
    nb,
    ja,
  };

  static setLocale(value: AvailableLocales) {
    dayjs.locale(value);
    Config.lsSave('locale', value);
  }

  static get current() {
    return dayjs.locale() as AvailableLocales;
  }

  static get currentDateFnsLocale() {
    return this.dateFnsLocale[Locale.current];
  }

  static get currentOption() {
    return (
      this.options.find((l) => l.value === dayjs.locale()) ?? this.options[0]
    );
  }

  static initialize() {
    const localLocale = Config.lsGet('locale');
    if (localLocale && localLocale !== 'en') {
      // Import locale from localstorage
      Locale.setLocale(localLocale);
    } else if (i18next.language && i18next.language !== 'en') {
      // Import locale from i18n language
      Locale.setLocale(i18next.language as AvailableLocales);
    }
  }
}
