import { CogniteSeismicClient } from "@cognite/seismic-sdk-js";

export class MockCogniteSeismicClient extends CogniteSeismicClient {
  file: any = {
    getLineRange: jest.fn(),
  };

  volume: any = {
    get: jest.fn(),
    getTrace: jest.fn(),
  };
}