/*!
 * Copyright 2020 Cognite AS
 */

/**
 * Hints that modifies how CAD sectors are loaded.
 */
export type CadLoadingHints = {
  /**
   * Optionally disables loading of sectors.
   */
  suspendLoading?: boolean;
};

export const defaultLoadingHints: Required<CadLoadingHints> = {
  suspendLoading: false
};
