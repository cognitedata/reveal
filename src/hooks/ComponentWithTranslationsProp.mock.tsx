import { makeDefaultTranslations, translationKeys } from 'utils/translations';

const defaultTranslations = makeDefaultTranslations('Test');

type Props = {
  translations: typeof defaultTranslations;
};

const ComponentWithTranslationsProp = ({ translations }: Props) => {
  const t = { ...defaultTranslations, translations };
  return <div>{t.Test}</div>;
};

ComponentWithTranslationsProp.translationNamespace =
  'ComponentWithTranslationsProp';
ComponentWithTranslationsProp.defaultTranslations = defaultTranslations;
ComponentWithTranslationsProp.translationKeys =
  translationKeys(defaultTranslations);

export default ComponentWithTranslationsProp;
