/*!
 * Copyright 2020 Cognite AS
 */

/**
 * Hints that are used to modify how CAD sectors are loaded.
 * @property `suspendLoading` - disables loading of sectors.
 */
export type CadLoadingHints = {
  suspendLoading?: boolean;
};

export const defaultLoadingHints: Required<CadLoadingHints> = {
  suspendLoading: false
};
