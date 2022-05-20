import { cleanup, fireEvent, screen } from '@testing-library/react';

import {
  mockProjectConfigMetadata,
  mockConfigDataWithLayers,
  mockMetadataWithQueries,
  mockConfigDataWithQueries,
} from '__test-utils/fixtures/projectConfigMetadata';
import { testRenderer } from '__test-utils/renderer';

import { Props, ProjectConfigForm } from '../ProjectConfigForm';

const getDefaultProps = (extras: Partial<Props> = {}) => ({
  config: {},
  onChange: jest.fn(),
  metadata: mockProjectConfigMetadata,
  ...extras,
});

describe('ProjectConfigForm', () => {
  beforeEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('ProjectConfigForm', () => {
    const defaultTestInit = (props = getDefaultProps()) =>
      testRenderer(ProjectConfigForm, undefined, props);

    it('should render both left & right panel by default', () => {
      defaultTestInit();

      // Selected field keyword on left panel appears twice as it is header on right panel
      expect(screen.getAllByText('General').length).toBe(2);
    });

    it('should trigger onChange with value upon changing value of Input', () => {
      const props = getDefaultProps();
      defaultTestInit(props);

      fireEvent.change(screen.getByPlaceholderText('Side Bar'), {
        target: { value: 5 },
      });

      expect(props.onChange).toHaveBeenCalledWith('general.sideBar', 5);
    });

    it('should switch right panel upon choosing different field in left Panel', async () => {
      const props = getDefaultProps({
        config: mockConfigDataWithLayers,
      });
      await defaultTestInit(props);
      fireEvent.click(screen.getByText('Documents'));

      expect(screen.getByText('Enabled')).toBeInTheDocument();
    });

    test('should show layers 1 data as children for truthy dataAsChildren metadata & trigger onChange on blurring json input for whole array', async () => {
      const props = getDefaultProps({
        config: mockConfigDataWithLayers,
      });
      await defaultTestInit(props);

      const map = screen.getByText('Map');
      fireEvent.click(map);
      const layers = screen.getByText('Layers');
      fireEvent.click(layers);

      fireEvent.click(screen.getAllByText('Layers 1')[0]);

      const mockFilters = { a: 1 };

      fireEvent.focusOut(screen.getByPlaceholderText('Filters'), {
        target: { value: JSON.stringify(mockFilters) },
      });

      expect(props.onChange).toHaveBeenCalledWith('map.layers', [
        { ...mockConfigDataWithLayers.map.layers[0], filters: mockFilters },
        ...mockConfigDataWithLayers.map.layers.splice(1),
      ]);
    });

    test('should show columns data as children for truthy dataAsChildren metadata & trigger onChange on blurring filters json for topmost array', async () => {
      const props = getDefaultProps({
        config: mockConfigDataWithQueries,
        metadata: mockMetadataWithQueries,
      });

      await defaultTestInit(props);

      const wells = screen.getByText('Wells');
      fireEvent.click(wells);
      const trajectory = screen.getByText('Trajectory');
      fireEvent.click(trajectory);
      const columns = screen.getByText('Columns');
      fireEvent.click(columns);

      fireEvent.click(screen.getAllByText('tvd')[0]);

      const mockQuery = [{ a: 1 }];

      fireEvent.focusOut(screen.getByPlaceholderText('Queries'), {
        target: { value: JSON.stringify(mockQuery) },
      });

      expect(props.onChange).toHaveBeenCalledWith('wells.trajectory.columns', [
        {
          ...mockConfigDataWithQueries.wells.trajectory.columns[0],
          queries: mockQuery,
        },
      ]);
    });
  });
});
