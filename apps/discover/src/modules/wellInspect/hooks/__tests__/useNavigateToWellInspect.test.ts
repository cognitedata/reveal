import { batch, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { renderHook } from '@testing-library/react-hooks';

import navigation from 'constants/navigation';
import { wellInspectActions } from 'modules/wellInspect/actions';

import { useNavigateToWellInspect } from '../useNavigateToWellInspect';

jest.mock('react-redux', () => ({
  batch: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
  useLocation: jest.fn(),
}));

describe('useNavigateToWellInspect', () => {
  const dispatch = jest.fn();
  const locationPathname = 'pathname';
  const historyPush = jest.fn();
  const setGoBackNavigationPath = jest.spyOn(
    wellInspectActions,
    'setGoBackNavigationPath'
  );
  const setPrerequisiteData = jest.spyOn(
    wellInspectActions,
    'setPrerequisiteData'
  );

  beforeEach(() => {
    (batch as jest.Mock).mockImplementation((callback: () => void) => {
      callback();
    });
    (useDispatch as jest.Mock).mockImplementation(() => dispatch);
    (useLocation as jest.Mock).mockImplementation(() => ({
      pathname: locationPathname,
    }));
    (useHistory as jest.Mock).mockImplementation(() => ({
      push: historyPush,
    }));
  });

  const getHookResult = () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useNavigateToWellInspect()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should handle navigate to well inspect as expected', () => {
    const navigateToWellInspect = getHookResult();

    const wellIds = ['well1'];
    const wellboreIds = ['well1/wellbore1', 'well1/wellbore2'];

    navigateToWellInspect({ wellIds, wellboreIds });

    expect(dispatch).toBeCalledTimes(2);
    expect(setGoBackNavigationPath).toBeCalledWith(locationPathname);
    expect(setPrerequisiteData).toBeCalledWith({ wellIds, wellboreIds });
    expect(historyPush).toBeCalledWith(navigation.SEARCH_WELLS_INSPECT);
  });
});
