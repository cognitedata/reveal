import {
  ConflictMode,
  CONFLICT_MODE,
  Destination,
  isFDMDestination,
  ResourceType,
  RESOURCE_TYPE_MAPPING,
} from '@transformations/types';
import { capitalizeEveryWord } from '@transformations/utils';

export const getActionTypeDisplayName = (selectedAction: ConflictMode) => {
  return capitalizeEveryWord(CONFLICT_MODE[selectedAction], ['or']);
};

export const getDestinationDisplayName = (d: Destination) => {
  if (isFDMDestination(d)) {
    if (d.type === 'nodes') {
      return d.view?.externalId;
    }
    if (d.type === 'edges') {
      return d.edgeType.externalId;
    }
    if (d.type === 'instances') {
      return d.dataModel.destinationRelationshipFromType
        ? `${d.dataModel.destinationType}.${d.dataModel.destinationRelationshipFromType}`
        : d.dataModel.destinationType;
    }
  }
  return capitalizeEveryWord(RESOURCE_TYPE_MAPPING[d.type]);
};

export const getResourceTypeDisplayName = (t: ResourceType) => {
  return capitalizeEveryWord(RESOURCE_TYPE_MAPPING[t]);
};
