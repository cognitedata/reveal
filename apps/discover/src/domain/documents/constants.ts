export const LAST_UPDATED_KEY_VALUE = 'sourceModifiedTime';
export const LAST_UPDATED_KEY = `sourceFile.${LAST_UPDATED_KEY_VALUE}` as const;
export const LAST_CREATED_KEY_VALUE = 'sourceCreatedTime';
export const LAST_CREATED_KEY = `sourceFile.${LAST_CREATED_KEY_VALUE}` as const;
export const INVALID_POLYGON_SEARCH_MESSAGE =
  'Please make sure polygon is valid. Eg: does not cross lines';
export const SMALLER_POLYGON_SEARCH_MESSAGE = 'Please draw a smaller polygon';
