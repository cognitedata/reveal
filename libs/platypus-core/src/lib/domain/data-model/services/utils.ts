import { DataModelTypeDefsType, DataModelTypeDefsField } from '../types';
import { KeyValueMap } from '../../../boundaries/types';
import {
  mixerApiBuiltInTypes,
  mixerApiInlineTypeDirectiveName,
} from '../constants';

export const getTypesMap = () => {
  const typesMap = {} as KeyValueMap;
  mixerApiBuiltInTypes.forEach((type) => {
    if (type.type === 'SCALAR' || type.type === 'OBJECT') {
      typesMap[type.name] = type.dmsType;
    }
  });

  return typesMap;
};

export const getOneToManyModelName = (
  referencingType: DataModelTypeDefsType,
  referencingField: DataModelTypeDefsField,
  modelVersion: string
) => {
  return `${referencingType.name}_${referencingField.type.name}_${referencingField.name}_${modelVersion}`;
};

export const isInlineType = (typeDef: DataModelTypeDefsType): boolean => {
  return (
    typeDef.directives !== undefined &&
    typeDef.directives.length > 0 &&
    typeDef.directives.some(
      (directive) => directive.name === mixerApiInlineTypeDirectiveName
    )
  );
};

export const isCustomType = (typeName: string) => {
  // eslint-disable-next-line no-prototype-builtins
  return !getTypesMap().hasOwnProperty(typeName);
};

export const getVersionedExternalId = (
  name: string,
  version: string
): string => {
  return `${name}_${version}`;
};
