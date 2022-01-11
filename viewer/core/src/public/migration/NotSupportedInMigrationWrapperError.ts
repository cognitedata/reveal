/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Error that is thrown for certain type of functionality that was supported in @cognite/3d-viewer,
 * but not in @cognite/reveal.
 * @module @cognite/reveal
 */
export class NotSupportedInMigrationWrapperError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
