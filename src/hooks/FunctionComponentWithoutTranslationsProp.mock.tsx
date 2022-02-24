function FunctionComponentWithoutTranslationsProp({
  label = 'Test',
}: {
  label: string;
}) {
  return <div>{label}</div>;
}

FunctionComponentWithoutTranslationsProp.translationKeys = ['Test'];

export default FunctionComponentWithoutTranslationsProp;
