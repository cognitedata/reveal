import { KeyValueMap } from '../../boundaries/types';

import {
  mixerApiBuiltInTypes,
  mixerApiInlineTypeDirectiveName,
} from './constants';
import {
  DataModelTransformation,
  DataModelTypeDefsType,
  DataModelVersion,
} from './types';

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
  switch (transformation.destination.type) {
    case 'data_model_instances':
      return transformation.destination.modelExternalId;
    case 'nodes':
      return transformation.destination.view.externalId;
    case 'edges':
      return transformation.destination.edgeType.externalId;
  }
};

export const getDestinationDisplayName = (
  transformation: DataModelTransformation
) => {
  switch (transformation.destination.type) {
    case 'data_model_instances':
      return transformation.destination.modelExternalId
        .split('_')
        .slice(0, -1)
        .join('.');
    case 'nodes':
      return transformation.destination.view.externalId;
    case 'edges':
      return transformation.destination.edgeType.externalId;
  }
};

export const groupTransformationsByTypes = (
  transformations: DataModelTransformation[]
) => {
  const destinations = transformations.map((transformation) => ({
    id: getDestinationId(transformation),
    displayName: getDestinationDisplayName(transformation),
  }));

  const groups: {
    [key: string]: {
      displayName: string;
      transformations: DataModelTransformation[];
    };
  } = {};

  destinations.forEach((item) => {
    groups[item.id] = {
      displayName: item.displayName,
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
Compare function used to sort DataModelVersion array with most recent createdTime first
*/
export const compareDataModelVersions = (
  a: { createdTime?: string | number },
  b: { createdTime?: string | number }
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

  return (
    new Date(b.createdTime as string).getTime() -
    new Date(a.createdTime as string).getTime()
  );
};
