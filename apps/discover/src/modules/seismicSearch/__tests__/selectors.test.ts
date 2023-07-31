import { renderHookWithStore } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import {
  useSeismic,
  useSeismicSurvey,
  useSelectedSurveys,
  useSelectedFiles,
} from '../selectors';

describe('seismic search selectors', () => {
  const extraProp = {
    seismicSearch: {
      dataResult: [{ survey: 'test-id' }, { survey: 'test-id-2' }],
      selections: {
        surveys: ['test-surveys'],
        files: [
          {
            surveyId: 'test-survey-id',
            fileId: 'test-file-id',
            fileName: 'test-file-name',
          },
        ],
      },
    },
  };
  const mockedStore = getMockedStore(extraProp);

  it('should return expected result with `useSeismic` hook', () => {
    const { result } = renderHookWithStore(useSeismic, mockedStore);
    expect(result.current).toMatchObject(extraProp.seismicSearch);
  });

  it('should return expected result with `useSeismicSurvey` hook', () => {
    const { result } = renderHookWithStore(
      () => useSeismicSurvey('test-id'),
      mockedStore
    );
    expect(result.current).toMatchObject(extraProp.seismicSearch.dataResult[0]);
  });

  it('should return expected result with `useSelectedSurveys` hook', () => {
    const { result } = renderHookWithStore(useSelectedSurveys, mockedStore);
    expect(result.current).toMatchObject(
      extraProp.seismicSearch.selections.surveys
    );
  });

  it('should return expected result with `useSelectedFiles` hook', () => {
    const { result } = renderHookWithStore(useSelectedFiles, mockedStore);
    expect(result.current).toMatchObject(
      extraProp.seismicSearch.selections.files
    );
  });
});
