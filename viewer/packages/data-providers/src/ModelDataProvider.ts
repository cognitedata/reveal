/*!
 * Copyright 2022 Cognite AS
 */

import type { DMModelIdentifier } from './model-identifiers/DMModelIdentifier';
import type { BinaryFileProvider, JsonFileProvider, DMSModelFilesBundle } from './types';

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
   * Fetches all signed file URLs for a DM model and the parsed content of a specific file.
   * Retrieves the full signed file list from the endpoint, locates `fileName` within it,
   * then downloads and parses that file's content via its signed URL.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM identifier containing revision info (required).
   * @param fileName        Name of the file whose content should be fetched (e.g. 'scene.json').
   * @returns Bundle with all signed file metadata and the parsed content of the requested file.
   */
  getDMSJsonFile(baseUrl: string, modelIdentifier: DMModelIdentifier, fileName: string): Promise<DMSModelFilesBundle>;

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
   * Downloads and parses the content of a specific file via a filtered signed URL request.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM identifier containing revision info (required).
   * @param fileName        Filename to fetch.
   * @returns The parsed content of the requested file.
   */
  getDMSJsonFileFromFileName(baseUrl: string, modelIdentifier: DMModelIdentifier, fileName: string): Promise<unknown>;
}
