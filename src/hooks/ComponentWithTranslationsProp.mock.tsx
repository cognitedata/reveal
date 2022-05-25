import { makeDefaultTranslations } from 'utils/translations';

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

export default ComponentWithTranslationsProp;
