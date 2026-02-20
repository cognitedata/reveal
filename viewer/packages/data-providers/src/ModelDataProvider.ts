/*!
 * Copyright 2022 Cognite AS
 */

import { DMModelIdentifier } from './model-identifiers/DMModelIdentifier';
import { BinaryFileProvider, DMSJsonFileProvider, JsonFileProvider } from './types';

/**
 * Provides data for 3D models.
 */
export interface ModelDataProvider extends JsonFileProvider, BinaryFileProvider, DMSJsonFileProvider {
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
   * @param modelIdentifier DM model identifier containing revision info (required).
   * @param fileName        Optional filename to filter by specific file path.
   */
  getDMSJsonFile(baseUrl: string, modelIdentifier: DMModelIdentifier, fileName?: string): Promise<unknown>;

  /**
   * Downloads signed binary blobs.
   * @param baseUrl     Base URL of the signed files endpoint.
   * @param fileNames    Filenames of signed binary files.
   * @param modelIdentifier DMS Model identifier for the model to fetch from.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   */
  getSignedBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;

  /**
   * Download and parse a JSON file through signed URL endpoint for a given file name.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM model identifier containing revision info (required).
   * @param fileName        Filename to filter by specific file path.
   */
  getDMSJsonFileFromFileName(baseUrl: string, modelIdentifier: DMModelIdentifier, fileName: string): Promise<unknown>;
}
