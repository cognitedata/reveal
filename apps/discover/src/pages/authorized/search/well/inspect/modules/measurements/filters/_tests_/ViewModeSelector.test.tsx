import { useDispatch } from 'react-redux';

import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { VIEW_MODES } from '../../constants';
import { ViewModeSelector, Props } from '../ViewModeSelector';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('View Mode Selector', () => {
  beforeEach(() => {
    (useDispatch as jest.Mock).mockImplementation(() => jest.fn());
  });

  const testInit = async (viewProps?: Props) =>
    testRenderer(ViewModeSelector, undefined, viewProps);

  it('should render view mode selector with view options', async () => {
    await testInit();
    expect(screen.getByText(VIEW_MODES[0])).toBeInTheDocument();
    expect(screen.getByText(VIEW_MODES[1])).toBeInTheDocument();
  });

  it('should fire callback on view mode change', async () => {
    const onChange = jest.fn();
    await testInit({ activeViewMode: VIEW_MODES[0], onChange });

    fireEvent.click(screen.getByText(VIEW_MODES[1]));
    expect(onChange).toBeCalledWith(VIEW_MODES[1]);
  });
});
