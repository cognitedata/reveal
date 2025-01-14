/*!
 * Copyright 2025 Cognite AS
 */
export type DMExternalId = string;
export type DMSpace = string;

/**
 * @public
 * CDF Data model instance reference
 */
export type DMInstanceRef = {
  externalId: string;
  space: string;
};
