/* eslint-disable lodash/prefer-noop, lodash/prefer-constant,  max-classes-per-file */
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import isUndefined from 'lodash/isUndefined';

import * as mocks from '@cognite/metrics/dist/mocks';

import { MockedCogniteClient } from '__mocks/MockedCogniteClient';
import { MockedDocumentSDKClient } from '__mocks/MockedDocumentSDKClient';
import { MockedSDKWells } from '__mocks/MockedSDKWells';
import { configureCacheMock } from '__test-utils/mockCache';
import { configureLocalStorageMock } from '__test-utils/mockLocalstorage';
import { setClient } from '_helpers/getCogniteSDKClient';

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
  const getAuthHeaders = () => ({
    auth: true,
    Authorization: 'Bearer fake-token',
  });
  return { ...rest, getCogniteSDKClient, getAuthHeaders };
});

jest.mock('@cognite/sdk-wells-v2', () => {
  const { ...rest } = jest.requireActual('@cognite/sdk-wells-v2');
  const createWellsClient = () => new MockedSDKWells();
  return { ...rest, createWellsClient };
});

jest.mock('modules/documentSearch/sdk', () => {
  const { ...rest } = jest.requireActual('modules/documentSearch/sdk');
  const getDocumentSDKClient = () => new MockedDocumentSDKClient();
  return { ...rest, getDocumentSDKClient };
});

jest.mock('_helpers/log', () => {
  return { log: () => false };
});

configureLocalStorageMock();
configureCacheMock();

if (isUndefined(window.URL.createObjectURL)) {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}

HTMLCanvasElement.prototype.getContext = jest.fn();
