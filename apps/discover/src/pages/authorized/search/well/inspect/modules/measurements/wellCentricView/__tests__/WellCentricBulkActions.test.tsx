import 'modules/map/__mocks/mockMapbox';
import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { CLEAR_SELECTION_TEXT } from 'pages/authorized/search/well/content/constants';

import { COMPARE_TEXT } from '../constants';
import { WellCentricBulkActions, Props } from '../WellCentricBulkActions';

const WELL_COUNT = 5;
const WELLBORE_COUNT = 10;

describe('WellCentricBulkActions Tests', () => {
  const page = (props: Props) => {
    return testRenderer(WellCentricBulkActions, undefined, props);
  };

  it('Should render with well and wellbore count ( multiple )', async () => {
    page({
      wellsCount: WELL_COUNT,
      wellboresCount: WELLBORE_COUNT,
      compare: jest.fn(),
      handleDeselectAll: jest.fn(),
    });
    expect(
      screen.getByText(`${WELLBORE_COUNT} wellbores selected`)
    ).toBeInTheDocument();
    expect(screen.getByText(`From ${WELL_COUNT} wells`)).toBeInTheDocument();
  });

  it('Should render with well and wellbore count ( single )', async () => {
    page({
      wellsCount: 1,
      wellboresCount: 1,
      compare: jest.fn(),
      handleDeselectAll: jest.fn(),
    });
    expect(screen.getByText('1 wellbore selected')).toBeInTheDocument();
    expect(screen.getByText('From 1 well')).toBeInTheDocument();
  });

  it('Should call compare callback', async () => {
    const compareCallback = jest.fn();
    page({
      wellsCount: 1,
      wellboresCount: 1,
      compare: compareCallback,
      handleDeselectAll: jest.fn(),
    });
    const compareButton = screen.getByText(COMPARE_TEXT);
    expect(compareButton).toBeInTheDocument();
    fireEvent.click(compareButton);
    expect(compareCallback).toBeCalledTimes(1);
  });

  it('Should call handle deselect callback', async () => {
    const handleDeselectAll = jest.fn();
    page({
      wellsCount: 1,
      wellboresCount: 1,
      compare: jest.fn(),
      handleDeselectAll,
    });
    const closeButton = screen.getByLabelText(CLEAR_SELECTION_TEXT);
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
    expect(handleDeselectAll).toBeCalledTimes(1);
  });
});
