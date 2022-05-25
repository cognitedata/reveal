import { makeDefaultTranslations } from 'utils/translations';

function FunctionComponentWithoutTranslationsProp({
  label = 'Test',
}: {
  label: string;
}) {
  return <div>{label}</div>;
}

FunctionComponentWithoutTranslationsProp.defaultTranslations =
  makeDefaultTranslations('Test');
FunctionComponentWithoutTranslationsProp.translationNamespace =
  'FunctionComponentWithoutTranslationsProp';

export default FunctionComponentWithoutTranslationsProp;
