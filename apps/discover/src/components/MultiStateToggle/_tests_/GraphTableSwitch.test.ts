import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { VIEW_MODES } from 'pages/authorized/search/well/inspect/modules/events/Npt/constants';

import { MultiStateToggle, Props } from '../MultiStateToggle';

const onChange = jest.fn();

const props: Props = {
  activeOption: 'Graph',
  options: VIEW_MODES,
  onChange,
};

describe('Graph Table Switch', () => {
  const page = (viewProps?: Props) =>
    testRenderer(MultiStateToggle, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(props),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should display switch buttons`, async () => {
    await defaultTestInit();
    expect(await screen.findByText(VIEW_MODES.Graph)).toBeInTheDocument();
    expect(await screen.findByText(VIEW_MODES.Table)).toBeInTheDocument();
  });

  it(`should fire callback on change`, async () => {
    await defaultTestInit();
    fireEvent.click(await screen.findByText(VIEW_MODES.Graph));
    expect(onChange).toHaveBeenCalledWith(VIEW_MODES.Graph);
    fireEvent.click(await screen.findByText(VIEW_MODES.Table));
    expect(onChange).toHaveBeenCalledWith(VIEW_MODES.Table);
  });
});
