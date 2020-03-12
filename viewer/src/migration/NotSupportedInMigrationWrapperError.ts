/*!
 * Copyright 2020 Cognite AS
 */

export class NotSupportedInMigrationWrapperError extends Error {
  constructor(message?: string) {
    message = message || NotSupportedInMigrationWrapperError.caller?.name || 'unknown';
    super(message);
  }
}
