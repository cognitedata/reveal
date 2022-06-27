import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { ViewModes } from 'pages/authorized/search/common/types';

import { MultiStateToggle, Props } from '../MultiStateToggle';

const onChange = jest.fn();

const props: Props = {
  activeOption: 'Graph',
  options: ViewModes,
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
    expect(await screen.findByText(ViewModes.Graph)).toBeInTheDocument();
    expect(await screen.findByText(ViewModes.Table)).toBeInTheDocument();
  });

  it(`should fire callback on change`, async () => {
    await defaultTestInit();
    fireEvent.click(await screen.findByText(ViewModes.Graph));
    expect(onChange).toHaveBeenCalledWith(ViewModes.Graph);
    fireEvent.click(await screen.findByText(ViewModes.Table));
    expect(onChange).toHaveBeenCalledWith(ViewModes.Table);
  });
});
