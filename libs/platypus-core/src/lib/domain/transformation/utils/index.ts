import { parseModelName } from '@platypus-core/domain/data-model/services/utils';
import { DataModelTransformation } from '../types';

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
Autogenerate a transformation externalId and name given some properties
*/
export const suggestTransformationProperties = ({
  dataModelExternalId,
  numExistingTransformations,
  typeName,
  version,
}: {
  dataModelExternalId: string;
  numExistingTransformations: number;
  typeName: string;
  version: string;
}) => {
  // 1-based index appended to transformation name and externalId for an attempt at
  // uniqueness
  const transformationIndex = numExistingTransformations + 1;

  return {
    externalId: `t_${dataModelExternalId}_${typeName}_${version}_${transformationIndex}`,
    name: `${typeName}_${version} ${transformationIndex}`,
  };
};
