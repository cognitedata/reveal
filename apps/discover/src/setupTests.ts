/* eslint-disable lodash/prefer-noop, lodash/prefer-constant,  max-classes-per-file */
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import isUndefined from 'lodash/isUndefined';
import { setClient } from 'utils/getCogniteSDKClient';

import * as mocks from '@cognite/metrics/dist/mocks';

import { MockedCogniteClient } from '__mocks/MockedCogniteClient';
import { configureCacheMock } from '__test-utils/mockCache';
import { configureLocalStorageMock } from '__test-utils/mockLocalstorage';
import { SIDECAR } from 'constants/app';
import { authenticateDocumentSDK } from 'modules/documentSearch/sdk';
import { setEnableWellSDKV3 } from 'modules/wellSearch/sdk';
import { authenticateWellSDK } from 'modules/wellSearch/sdk/v3';

export const TEST_PROJECT = 'testProject';

authenticateDocumentSDK(
  'discover-test',
  `https://${SIDECAR.cdfCluster}.cognitedata.com`,
  TEST_PROJECT,
  'test-token'
);

setEnableWellSDKV3(true);
authenticateWellSDK(
  SIDECAR.applicationId,
  SIDECAR.cdfApiBaseUrl,
  TEST_PROJECT,
  'test-token'
);

jest.mock('@cognite/metrics', () => mocks);
jest.setTimeout(3000);

jest.mock('react-i18next', () => {
  const { ...rest } = jest.requireActual('react-i18next');

  return {
    ...rest,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});
jest.mock('@cognite/react-i18n', () => {
  return {
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

jest.mock('@cognite/seismic-sdk-js', () => {
  class CogniteSeismicClient {
    public file = {
      getTextHeader: () =>
        Promise.resolve({
          meta: {
            header: 'test',
          },
        }),
    };
  }

  return { CogniteSeismicClient };
});

jest.mock('mapbox-gl', () => {
  class ScaleControl {}
  class Map {
    removeLayer = jest.fn();

    addControl = jest.fn();

    on = jest.fn();

    addSource = jest.fn();

    isStyleLoaded = () => true;

    getLayer = () => true;

    getSource = (name: string) => ({
      name,
      setData: jest.fn(),
    });
  }

  class LngLat {
    _lng: number;

    _lat: number;

    constructor(lng: number, lat: number) {
      // eslint-disable-next-line no-underscore-dangle
      this._lng = lng;
      // eslint-disable-next-line no-underscore-dangle
      this._lat = lat;
    }
  }

  return { Map, ScaleControl, LngLat };
});

jest.mock('html2canvas', () => {
  return () =>
    Promise.resolve({
      toDataURL() {
        return '';
      },
    });
});

jest.mock('@cognite/sdk', () => {
  const CogniteClient = MockedCogniteClient;
  return { CogniteClient };
});

// @ts-expect-error 74 missing properties
setClient(new MockedCogniteClient());

jest.mock('@cognite/react-container', () => {
  const { ...rest } = jest.requireActual('@cognite/react-container');
  const getCogniteSDKClient = () => new MockedCogniteClient();
  const getTenantInfo = () => [TEST_PROJECT];
  const getAuthHeaders = () => ({
    auth: true,
    Authorization: 'Bearer fake-token',
  });
  return { ...rest, getTenantInfo, getCogniteSDKClient, getAuthHeaders };
});

jest.mock('utils/log', () => {
  return { log: () => false };
});

configureLocalStorageMock();
configureCacheMock();

if (isUndefined(window.URL.createObjectURL)) {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}

HTMLCanvasElement.prototype.getContext = jest.fn();
