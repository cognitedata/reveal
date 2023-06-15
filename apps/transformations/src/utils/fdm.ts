import { FlattenedDataModel } from './transformation';

const FDM_KEY_SEPARATOR = ' - ';

export const getDataModelKey = ({
  externalId,
  space,
}: {
  externalId: string;
  space: string;
}): string => {
  return externalId.concat(FDM_KEY_SEPARATOR, space);
};

export const parseDataModelKey = (
  key: string
): { externalId: string; space: string } => {
  const splitted = key.split(FDM_KEY_SEPARATOR);
  return {
    externalId: splitted[0],
    space: splitted[1],
  };
};

export const getSelectedModel = (
  models: FlattenedDataModel[],
  {
    externalId: selectedModelExternalId,
    space: selectedModelSpace,
  }: { externalId?: string; space?: string }
): FlattenedDataModel | undefined => {
  if (!selectedModelExternalId || !selectedModelSpace) {
    return undefined;
  }

  return models.find(
    ({ externalId, space }) =>
      externalId === selectedModelExternalId && space === selectedModelSpace
  );
};
