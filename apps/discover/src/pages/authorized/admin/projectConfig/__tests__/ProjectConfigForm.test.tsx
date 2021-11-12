import { cleanup, fireEvent, screen, act } from '@testing-library/react';

import {
  mockProjectConfigMetadata,
  mockConfigDataWithLayers,
} from '__test-utils/fixtures/projectConfigMetadata';
import { testRenderer } from '__test-utils/renderer';

import {
  ProjectConfigForm,
  adaptedSelectedPathToMetadataPath,
} from '../ProjectConfigForm';

const defaultProps = {
  config: {},
  onChange: jest.fn(),
  metadata: mockProjectConfigMetadata,
};

describe('ProjectConfigForm', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  const defaultTestInit = (props = defaultProps) =>
    testRenderer(ProjectConfigForm, undefined, props);

  it('should render both left & right panel by default', () => {
    defaultTestInit();

    // Selected field keyword on left panel appears twice as it is header on right panel
    expect(screen.getAllByText('General').length).toBe(2);
  });

  it('should trigger onChange with value upon changing value of Input', () => {
    defaultTestInit();

    fireEvent.change(screen.getByPlaceholderText('Side Bar'), {
      target: { value: 5 },
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith('general.sideBar', 5);
  });

  it('should switch right panel upon choosing different field in left Panel', async () => {
    await act(async () => {
      await defaultTestInit();

      fireEvent.click(screen.getByText('Documents'));

      expect(screen.queryByText('Disabled')).toBeInTheDocument();
    });
  });

  test('should show layers 1 data as children for truthy dataAsChildren metadata & trigger onChange on blurring json input', async () => {
    await act(async () => {
      await defaultTestInit({
        ...defaultProps,
        config: mockConfigDataWithLayers,
      });
      const map = screen.getByText('Map');
      fireEvent.click(map);
      const layers = screen.getByText('Layers');
      fireEvent.click(layers);

      fireEvent.click(screen.getAllByText('Layers 1')[0]);

      const mockFilters = { a: 1 };

      fireEvent.focusOut(screen.getByPlaceholderText('Filters'), {
        target: { value: JSON.stringify(mockFilters) },
      });

      expect(defaultProps.onChange).toHaveBeenCalled();
      const onChangeArgs = defaultProps.onChange.mock.calls[0];
      expect(onChangeArgs[0]).toBe('map.layers.0.filters');
      expect(onChangeArgs[1]).toStrictEqual(mockFilters);
    });
  });

  describe('adaptedSelectedPathToMetadataPath', () => {
    test('should inject selected path with children keyword at each level for accessing nested metadata', () => {
      expect(
        adaptedSelectedPathToMetadataPath('wells.trajectory.enabled')
      ).toBe('wells.children.trajectory.children.enabled');
    });
    test('should replace number accessor with children for accessing dataAsChildren metadata', () => {
      expect(adaptedSelectedPathToMetadataPath('map.layers.0.filters')).toBe(
        'map.children.layers.children.filters'
      );
    });
    test('should return empty string when selected path is empty', () => {
      expect(adaptedSelectedPathToMetadataPath('')).toBe('');
    });
    test('should return empty path when no path is sent', () => {
      expect(adaptedSelectedPathToMetadataPath()).toBe('');
    });
  });
});
