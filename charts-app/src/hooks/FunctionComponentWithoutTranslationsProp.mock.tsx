import { makeDefaultTranslations, translationKeys } from 'utils/translations';

function FunctionComponentWithoutTranslationsProp({
  label = 'Test',
}: {
  label: string;
}) {
  return <div>{label}</div>;
}

const defaultTranslations = makeDefaultTranslations('Test');
FunctionComponentWithoutTranslationsProp.defaultTranslations =
  defaultTranslations;
FunctionComponentWithoutTranslationsProp.translationKeys =
  translationKeys(defaultTranslations);
FunctionComponentWithoutTranslationsProp.translationNamespace =
  'FunctionComponentWithoutTranslationsProp';

export default FunctionComponentWithoutTranslationsProp;
