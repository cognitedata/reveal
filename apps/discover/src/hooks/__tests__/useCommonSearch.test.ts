import { useDispatch } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';
import { convertGeometryToGeoJson } from 'services/savedSearches/normalizeSavedSearch';
import { FetchHeaders } from 'utils/fetch';

import { Geometry } from '@cognite/seismic-sdk-js';

import { useProjectConfig } from 'hooks/useProjectConfig';
import { setGeo } from 'modules/map/actions';
import { SET_SEARCH_PHRASE } from 'modules/sidebar/constants';

import { QueryClientWrapper } from '../../__test-utils/queryClientWrapper';
import { useCommonSearch } from '../useCommonSearch';
import { useDocumentSearch } from '../useDocumentSearch';
import { useSeismicSearch } from '../useSeismicSearch';
import { useWellsSearch } from '../useWellsSearch';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('hooks/useProjectConfig', () => ({
  useProjectConfig: jest.fn(),
}));

jest.mock('services/savedSearches/normalizeSavedSearch', () => ({
  convertGeometryToGeoJson: jest.fn(),
}));

jest.mock('modules/map/actions', () => ({
  setGeo: jest.fn(),
}));

jest.mock('hooks/useDocumentSearch', () => ({
  useDocumentSearch: jest.fn(),
}));

jest.mock('hooks/useSeismicSearch', () => ({
  useSeismicSearch: jest.fn(),
}));

jest.mock('hooks/useWellsSearch', () => ({
  useWellsSearch: jest.fn(),
}));

const headers: FetchHeaders = { headers: 'headers' };
const geometry: Geometry = {
  type: 'Point',
  coordinates: [0, 0],
};

describe('useCommonSearch hook', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
    (useProjectConfig as jest.Mock).mockImplementation(() => ({}));
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonSearch(), {
      wrapper: QueryClientWrapper,
    });
    waitForNextUpdate();
    return result.current;
  };

  it('should call dispatch as expected for empty search query', async () => {
    const doCommonSearch = await getHookResult();

    doCommonSearch({}, headers);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('should call convertGeometryToGeoJson as expected', async () => {
    const doCommonSearch = await getHookResult();

    doCommonSearch({}, headers);
    expect(convertGeometryToGeoJson).not.toHaveBeenCalled();

    // @ts-expect-error hack for the deprecated field
    doCommonSearch({ geometry }, headers);
    expect(convertGeometryToGeoJson).toHaveBeenCalledTimes(1);
  });

  it('should dispatch setGeo as expected', async () => {
    const doCommonSearch = await getHookResult();

    doCommonSearch({}, headers);
    expect(setGeo).not.toHaveBeenCalled();

    doCommonSearch({ geoJson: [{ geometry }] }, headers);
    expect(setGeo).toHaveBeenCalledTimes(1);
    expect(setGeo).toHaveBeenCalledWith([{ geometry }], true);
  });

  it('should dispatch search query as expected', async () => {
    const doCommonSearch = await getHookResult();
    const query = 'test-query';
    const expectedSearchPhraseAction = {
      payload: query,
      type: SET_SEARCH_PHRASE,
    };

    doCommonSearch({ query }, headers);
    expect(dispatch).toHaveBeenCalledWith(expectedSearchPhraseAction);
  });
});

describe('useCommonSearch hook -> inner hook callbacks test', () => {
  const dispatch = jest.fn();
  const doDocumentSearch = jest.fn();
  const doSeismicSearch = jest.fn();
  const doWellsSearch = jest.fn();

  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
    (useProjectConfig as jest.Mock).mockImplementation(() => ({
      data: {
        documents: {},
        seismic: {},
        wells: {},
      },
    }));
    (useDocumentSearch as jest.Mock).mockImplementation(() => doDocumentSearch);
    (useSeismicSearch as jest.Mock).mockImplementation(() => doSeismicSearch);
    (useWellsSearch as jest.Mock).mockImplementation(() => doWellsSearch);
  });

  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonSearch());
    waitForNextUpdate();
    return result.current;
  };

  it('should call inner hook callbacks as expected', async () => {
    const doCommonSearch = await getHookResult();

    doCommonSearch({}, headers);
    expect(doDocumentSearch).toHaveBeenCalledTimes(1);
    expect(doSeismicSearch).toHaveBeenCalledTimes(1);
    expect(doWellsSearch).toHaveBeenCalledTimes(1);
  });
});
