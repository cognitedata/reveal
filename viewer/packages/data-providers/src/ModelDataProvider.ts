/*!
 * Copyright 2022 Cognite AS
 */

import { ModelIdentifier } from './ModelIdentifier';
import { BinaryFileProvider, DMSBinaryFileProvider, JsonFileProvider } from './types';

/**
 * Provides data for 3D models.
 */
export interface ModelDataProvider extends JsonFileProvider, BinaryFileProvider, DMSBinaryFileProvider {
  /**
   * Download and parse a JSON file and return the resulting struct.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of JSON file.
   */
  getJsonFile(baseUrl: string, fileName: string, modelIdentifier?: ModelIdentifier): Promise<any>;
  /**
   * Downloads a binary blob.
   * @param baseUrl     Base URL of the model.
   * @param fileName    Filename of binary file.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   */
  getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;

  /**
   * Downloads multiple signed binary blobs.
   * @param fileNames  Filenames of binary files.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   */
  getSignedBinaryFiles(
    baseUrl: string,
    fileNames: string[],
    modelIdentifier?: ModelIdentifier,
    abortSignal?: AbortSignal
  ): Promise<ArrayBuffer[]>;
}
