/*!
 * Copyright 2025 Cognite AS
 */

import { DMModelIdentifier } from './model-identifiers/DMModelIdentifier';
import { ModelIdentifier } from './ModelIdentifier';
import { DMSBinaryFileProvider, DMSJsonFileProvider } from './types';

/**
 * Provides data for 3D models.
 */
export interface DMSModelDataProvider extends DMSJsonFileProvider, DMSBinaryFileProvider {
  /**
   * Download and parse a JSON file and return the resulting struct.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of JSON file.
   */
  getJsonFile(baseUrl: string, fileName: string, modelIdentifier?: DMModelIdentifier): Promise<unknown>;
  /**
   * Downloads a signed binary blob.
   * @param fileNames    Filename of signed binary file.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   * @param modelIdentifier Optional Model identifier for the model to fetch from.
   */
  getSignedBinaryFiles(
    baseUrl: string,
    fileNames: string[],
    modelIdentifier?: ModelIdentifier,
    abortSignal?: AbortSignal
  ): Promise<ArrayBuffer[]>;
}
