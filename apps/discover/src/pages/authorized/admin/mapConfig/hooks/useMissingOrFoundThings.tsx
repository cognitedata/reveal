import { SCHEMA_ID_MAP_CONFIG } from '../service/constants';

import { Status } from './useMapConfigSetupStatus';

const SPACE_TITLE = 'Space';
const MODEL_TITLE = 'Models';
const SCHEMA_TITLE = 'Schema';
const SCHEMA_VERSION_TITLE = 'Schema Version 1';

/**
 * This checks the project to see if all the requirements are setup
 */
export const useMissingOrFoundThings = (data: Status) => {
  const missing = [];
  const found = [];

  if (data.models.length > 0) {
    found.push(MODEL_TITLE);
  } else {
    missing.push(MODEL_TITLE);
  }

  if (data.spaces.length > 0) {
    found.push(SPACE_TITLE);
  } else {
    missing.push(SPACE_TITLE);
  }

  if (data.schemas.includes(SCHEMA_ID_MAP_CONFIG)) {
    found.push(SCHEMA_TITLE);
  } else {
    missing.push(SCHEMA_TITLE);
  }

  if (
    data.versions.find((version) => {
      if (version.externalId === SCHEMA_ID_MAP_CONFIG) {
        if (version.versions.length > 0) {
          return true;
        }
      }

      return false;
    })
  ) {
    found.push(SCHEMA_VERSION_TITLE);
  } else {
    missing.push(SCHEMA_VERSION_TITLE);
  }

  return {
    missing,
    found,
  };
};
