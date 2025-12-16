/*!
 * Copyright 2022 Cognite AS
 */

import { DMModelIdentifier } from './model-identifiers/DMModelIdentifier';
import { BinaryFileProvider, DMSBinaryFileProvider, DMSJsonFileProvider, JsonFileProvider } from './types';

/**
 * Provides data for 3D models.
 */
export interface ModelDataProvider
  extends JsonFileProvider,
    BinaryFileProvider,
    DMSBinaryFileProvider,
    DMSJsonFileProvider {
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

  /** * Download and parse a JSON file and return the resulting struct.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of JSON file.
   * @param modelIdentifier Optional Model identifier for the model to fetch from.
   */
  getDMSJsonFile(baseUrl: string, fileName: string, modelIdentifier?: DMModelIdentifier): Promise<unknown>;

  /**
   * Downloads signed binary blobs.
   * @param fileNames    Filenames of signed binary files.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   * @param modelIdentifier Optional DMS Model identifier for the model to fetch from.
   */
  getSignedBinaryFiles(
    baseUrl: string,
    fileNames: string[],
    modelIdentifier?: DMModelIdentifier,
    abortSignal?: AbortSignal
  ): Promise<ArrayBuffer[]>;
}
