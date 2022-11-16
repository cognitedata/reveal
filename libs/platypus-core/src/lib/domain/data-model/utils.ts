import { DataModelTransformation, DataModelTypeDefsType } from './types';
import { KeyValueMap } from '../../boundaries/types';
import {
  mixerApiBuiltInTypes,
  mixerApiInlineTypeDirectiveName,
} from './constants';

export const getDataModelEndpointUrl = (
  projectName: string,
  dataModelName: string,
  version: string,
  baseUrl: string
) => {
  return `${baseUrl}/api/v1/projects/${projectName}/schema/api/${dataModelName}/${version}/graphql`;
};

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
  referencingTypeName: string,
  referencingFieldName: string,
  modelVersion: string
) => {
  return `${referencingTypeName}_${referencingFieldName}_${modelVersion}`;
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

export const groupTransformationsByTypes = (
  transformations: DataModelTransformation[]
) => {
  const modelExternalIds = transformations.map(
    (transformation) => transformation.destination.modelExternalId
  );

  const groups: {
    [key: string]: {
      displayName: string;
      transformations: DataModelTransformation[];
    };
  } = {};

  modelExternalIds.forEach((model) => {
    groups[model] = {
      displayName: parseModelName(model),
      transformations: [],
    };
  });

  transformations.forEach((transformation) => {
    const { modelExternalId } = transformation.destination;

    if (groups[modelExternalId].transformations) {
      groups[modelExternalId].transformations.push(transformation);
    }
  });

  return groups;
};

/*
Parse a model name created by getVersionedExternalId or getOneToManyModelName
and return a prettified version. For example:

Movie_1 => Movie
Movie_actors_3 => Movie.actors
*/
export const parseModelName = (modelName: string) => {
  return modelName.split('_').slice(0, -1).join('.');
};
