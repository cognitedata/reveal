import { makeDefaultTranslations } from 'utils/translations';

const defaultTranslations = makeDefaultTranslations('Test');

type Props = {
  translations: typeof defaultTranslations;
};

const ComponentWithTranslationsProp = ({ translations }: Props) => {
  const t = { ...defaultTranslations, translations };
  return <div>{t.Test}</div>;
};

// Arrow functions would need displayName
ComponentWithTranslationsProp.displayName = 'ComponentWithTranslationsProp';
ComponentWithTranslationsProp.translationKeys =
  Object.keys(defaultTranslations);

export default ComponentWithTranslationsProp;
