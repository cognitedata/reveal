import {
  DataModelTypeDefsType,
  mixerApiInlineTypeDirectiveName,
} from '@platypus-core/domain/data-model';

export const splitCamelCase = (str: string) => {
  return str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
};
export const capitalizeFirstLetter = (word: string) => {
  if (!word) return word;
  return word[0].toUpperCase() + word.slice(1);
};
export const getFilterOptionLabel = (optionName: string) => {
  return capitalizeFirstLetter(splitCamelCase(optionName).toLowerCase());
};
export const isEdgeType = (typeDef: DataModelTypeDefsType): boolean => {
  return (
    typeDef.directives !== undefined &&
    typeDef.directives.length > 0 &&
    typeDef.directives.some(
      (directive) =>
        directive.name === mixerApiInlineTypeDirectiveName ||
        // TODO: remove this when we have backend support for aggregating on edge types
        directive.name === 'edge'
    )
  );
};
