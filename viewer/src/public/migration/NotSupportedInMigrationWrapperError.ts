/*!
 * Copyright 2020 Cognite AS
 */

export class NotSupportedInMigrationWrapperError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
