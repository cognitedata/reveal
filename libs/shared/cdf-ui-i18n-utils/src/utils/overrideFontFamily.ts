import { getLanguage } from './i18n';

const FONT_FAMILIES: Record<string, string> = {
  ja: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC'",
  ko: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC'",
  zh: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans KR'",
};

export const overrideFontFamily = () => {
  const language = getLanguage() ?? '';

  if (Object.keys(FONT_FAMILIES).includes(language)) {
    const style: HTMLStyleElement = document.createElement('style');
    document.head.appendChild(style);
    style.sheet?.insertRule(
      `body { font-family: ${FONT_FAMILIES[language]}; }`
    );
  }
};
