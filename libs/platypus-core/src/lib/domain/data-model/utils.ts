import {
  DataModelTransformation,
  DataModelTypeDefsType,
  DataModelVersion,
} from './types';
import { KeyValueMap } from '../../boundaries/types';
import {
  mixerApiBuiltInTypes,
  mixerApiInlineTypeDirectiveName,
} from './constants';

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

const getDestinationId = (transformation: DataModelTransformation) => {
  return transformation.destination.type === 'data_model_instances'
    ? transformation.destination.modelExternalId
    : `${transformation.destination.viewExternalId}_${transformation.destination.viewVersion}`;
};

export const groupTransformationsByTypes = (
  transformations: DataModelTransformation[]
) => {
  const destinationIds = transformations.map(getDestinationId);

  const groups: {
    [key: string]: {
      displayName: string;
      transformations: DataModelTransformation[];
    };
  } = {};

  destinationIds.forEach((id) => {
    groups[id] = {
      displayName: parseModelName(id),
      transformations: [],
    };
  });

  transformations.forEach((transformation) => {
    const destinationId = getDestinationId(transformation);

    if (groups[destinationId].transformations) {
      groups[destinationId].transformations.push(transformation);
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

/*
Compare function used to sort DataModelVersion array with most recent createdTime first
*/
export const compareDataModelVersions = (
  a: DataModelVersion,
  b: DataModelVersion
) => {
  if (a.createdTime === undefined && b.createdTime === undefined) {
    return 0;
  }

  // sort b after a
  if (b.createdTime === undefined) {
    return -1;
  }

  // sort a after b
  if (a.createdTime === undefined) {
    return 1;
  }

  return b.createdTime - a.createdTime;
};
