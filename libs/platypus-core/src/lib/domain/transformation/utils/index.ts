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
