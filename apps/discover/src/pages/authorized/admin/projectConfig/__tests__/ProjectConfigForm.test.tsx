import { cleanup, fireEvent, screen, act } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ProjectConfigForm } from '../ProjectConfigForm';

const defaultProps = {
  config: {},
  onChange: jest.fn(),
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
});
