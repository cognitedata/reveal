import { Router } from 'react-router-dom';

import { renderHook } from '@testing-library/react-hooks';
import { createBrowserHistory, createLocation } from 'history';

import { testWrapper as wrapper } from '__test-utils/renderer';

import { useSelectedPath } from '../useSelectedPath';

describe('useSelectedPath', () => {
  it('should return selectedPath from first key in metadata', () => {
    const { result } = renderHook(
      () => useSelectedPath({ hide: { label: 'Hide', type: 'boolean' } }),
      { wrapper }
    );
    expect(result.current.selectedPath).toBe('hide');
  });

  it('should set selectedPath on calling setSelectedPath', () => {
    const { result } = renderHook(
      () =>
        useSelectedPath({
          map: {
            label: 'Map',
            type: 'object',
            children: {
              cluster: { label: 'Cluster', type: 'boolean' },
            },
          },
        }),
      { wrapper }
    );
    result.current.setSelectedPath('map.cluster');
    expect(result.current.selectedPath).toBe('map.cluster');
  });

  it('should set selectedPath on calling setSelectedPath when path has space in it', () => {
    const { result } = renderHook(
      () =>
        useSelectedPath({
          'main map': {
            label: 'Map',
            type: 'object',
            children: {
              'great cluster': { label: 'Cluster', type: 'boolean' },
            },
          },
        }),
      { wrapper }
    );
    result.current.setSelectedPath('main map.great cluster');
    expect(result.current.selectedPath).toBe('main map.great cluster');
  });

  it('should return selectedPath with value already set in history', () => {
    const { result } = renderHook(
      () =>
        useSelectedPath({
          favorites: {
            label: 'Favorites',
            type: 'object',
            children: {
              showDocumentButton: {
                label: 'Show Document Button',
                type: 'boolean',
              },
            },
          },
        }),
      {
        wrapper: ({ children }: any) => {
          const history = createBrowserHistory();
          history.location = createLocation(
            '/projectConfig?selectedPath=favorites.showDocumentButton'
          );
          return <Router history={history}>{children}</Router>;
        },
      }
    );
    expect(result.current.selectedPath).toBe('favorites.showDocumentButton');
  });
});
