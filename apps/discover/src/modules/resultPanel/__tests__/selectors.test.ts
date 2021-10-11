import { useSelector } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';

import { Modules } from 'modules/sidebar/types';

import {
  useResultPanel,
  useSortByOptions,
  useResultPanelWidth,
  useActivePanel,
} from '../selectors';

const appState = {
  resultPanel: {
    sortBy: {},
    panelWidth: 200,
    activePanel: Modules.WELLS,
  },
};

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const doBeforeEach = () => {
  (useSelector as jest.Mock).mockImplementation((callback) => {
    return callback(appState);
  });
};

describe('Result panel selectors', () => {
  beforeEach(doBeforeEach);

  it(`should return result panel state`, () => {
    expect(useResultPanel()).toEqual(appState.resultPanel);
  });

  it(`should return sortBy options`, () => {
    const { result } = renderHook(() => useSortByOptions(), {});
    const sortBy = result.current;
    expect(sortBy).toEqual(appState.resultPanel.sortBy);
  });

  it(`should return result panel width`, () => {
    const { result } = renderHook(() => useResultPanelWidth(), {});
    const resultPanelWidth = result.current;
    expect(resultPanelWidth).toEqual(appState.resultPanel.panelWidth);
  });

  it(`should return active panel`, () => {
    const { result } = renderHook(() => useActivePanel(), {});
    const activePanel = result.current;
    expect(activePanel).toEqual(appState.resultPanel.activePanel);
  });
});
