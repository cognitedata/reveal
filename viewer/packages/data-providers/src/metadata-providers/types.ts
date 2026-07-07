/*!
 * Copyright 2026 Cognite AS
 */

import type { SignedFileItem } from '../types';

export type MetadataWithSignedFiles<T> = {
  /**
   * Signed files metadata.
   */
  readonly signedFiles: { items: SignedFileItem[] } | undefined;
  /**
   * File Data with metadata.
   */
  readonly fileData: T;
};
