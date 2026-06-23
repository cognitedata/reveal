/*!
 * Copyright 2022 Cognite AS
 */

import type { DMModelIdentifier } from './model-identifiers/DMModelIdentifier';
import type { BinaryFileProvider, JsonFileProvider } from './types';

/**
 * Provides data for 3D models.
 */
export interface ModelDataProvider extends JsonFileProvider, BinaryFileProvider {
  /**
   * Download and parse a JSON file and return the resulting struct.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of JSON file.
   */
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
  /**
   * Downloads a binary blob.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of binary file.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   */
  getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;

  /**
   * Download and parse a JSON file through signed URL endpoint.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM identifier containing revision info (required).
   * @param fileName        Optional filename to filter by specific file path.
   */
  getDMSJsonFile(baseUrl: string, modelIdentifier: DMModelIdentifier, fileName: string): Promise<unknown>;

  /**
   * Downloads signed binary blobs.
   * @param signedUrl  Signed URL pointing to the binary file.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   */
  getSignedBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;

  /**
   * Downloads and parses a JSON file via a signed URL (no auth headers, no binary conversion).
   * @param signedUrl   Signed URL pointing to a JSON file.
   */
  getSignedJsonFile(signedUrl: string): Promise<unknown>;

  /**
   * Download and parse a JSON file through signed URL endpoint for a given file name and a DM identifier.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM identifier containing revision info (required).
   * @param fileName        Filename to filter by specific file path.
   */
  getDMSJsonFileFromFileName(baseUrl: string, modelIdentifier: DMModelIdentifier, fileName: string): Promise<unknown>;
}
