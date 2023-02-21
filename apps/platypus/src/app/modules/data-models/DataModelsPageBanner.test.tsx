import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import noop from 'lodash/noop';
import { isFDMv3 } from '@platypus-app/flags/isFDMv3';
import { useBetaDataModels } from './hooks/useBetaDataModels';

import { Banner } from './DataModelsPage';

jest.mock('@platypus-app/flags/isFDMv3');
jest.mock('./hooks/useBetaDataModels');

const mockedIsFDMv3 = jest.mocked(isFDMv3);
const mockedUseBetaDataModels = jest.mocked(useBetaDataModels as any);

describe('DataModelsPage', () => {
  it('always shows when using DMS V2', () => {
    mockedIsFDMv3.mockReturnValueOnce(false);
    mockedUseBetaDataModels.mockReturnValueOnce({ data: [] });

    render(<Banner />);

    expect(
      screen.getByText(
        /These data models were created with a previous beta version /i
      )
    ).toBeTruthy();
  });
  it('can click close button', () => {
    mockedIsFDMv3.mockReturnValueOnce(false);
    mockedUseBetaDataModels.mockReturnValueOnce({
      data: [],
    });

    render(<Banner />);

    userEvent.click(screen.getByTestId('banner-close-button'));

    expect(
      screen.queryByText(
        /These data models were created with a previous beta version /i
      )
    ).toBeFalsy();
  });
  it('can click open button', () => {
    mockedIsFDMv3.mockReturnValueOnce(false);
    mockedUseBetaDataModels.mockReturnValueOnce({
      data: [],
    });

    window.open = jest.fn();

    render(<Banner />);

    userEvent.click(screen.getByTestId('banner-open-button'));

    expect(window.open).toBeCalled();
  });

  it('dont shows when using DMS V3 and no spaces in DMS v2', () => {
    mockedIsFDMv3.mockReturnValueOnce(true);
    mockedUseBetaDataModels.mockReturnValueOnce({ data: [] });

    render(<Banner />);

    expect(
      screen.queryByText(/To work with data models you created with the /i)
    ).toBeFalsy();
  });
  it('dont shows when using DMS V3 and no spaces in DMS v2', () => {
    mockedIsFDMv3.mockReturnValueOnce(true);
    mockedUseBetaDataModels.mockReturnValueOnce({ data: [{}, {}] });

    render(<Banner />);

    expect(
      screen.getByText(/To work with data models you created with the /i)
    ).toBeTruthy();
  });
});
