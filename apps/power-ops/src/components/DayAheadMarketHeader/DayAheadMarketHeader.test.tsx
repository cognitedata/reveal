import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { getTestCogniteClient, testRenderer } from 'utils/test';

import { DayAheadMarketHeader } from './DayAheadMarketHeader';
import { mockProcessConfigurations } from './DayAheadMarketHeader.mock';

jest.mock('@cognite/react-container', () => {
  return {
    ...jest.requireActual('@cognite/react-container'),
    useAuthenticatedAuthContext: jest.fn(),
  };
});

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

const mockDownloadFunction = jest.fn(() => Promise.resolve());

const mockDayAheadMarketHeaderData = {
  priceAreaName: 'price_area_test',
  startDate: new Date().toString(),
};

const MockDayAheadMarketHeader: React.FC<{ show?: boolean }> = ({
  show = false,
}) => {
  const [showConfirmDownloadModal, setShowConfirmDownloadModal] =
    React.useState(show);
  const [downloading] = React.useState(false);

  return (
    <DayAheadMarketHeader
      bidProcessExternalId="bidprocess_externalid"
      startDate={mockDayAheadMarketHeaderData.startDate}
      processConfigurations={mockProcessConfigurations}
      priceAreaName={mockDayAheadMarketHeaderData.priceAreaName}
      showConfirmDownloadModal={showConfirmDownloadModal}
      onChangeShowConfirmDownloadModal={setShowConfirmDownloadModal}
      onChangeProcessConfigurationExternalId={jest.fn()}
      downloading={downloading}
      onDownloadMatrix={() => mockDownloadFunction()}
      onDownloadButtonClick={() => mockDownloadFunction()}
    />
  );
};

describe('Day Ahead Market header tests', () => {
  beforeEach(() => {
    (useAuthenticatedAuthContext as jest.Mock).mockImplementation(() => ({
      client: getTestCogniteClient(),
    }));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should render the price area name', async () => {
    testRenderer(<MockDayAheadMarketHeader />);

    expect(
      await screen.findByText(
        `Price Area ${mockDayAheadMarketHeaderData.priceAreaName}`
      )
    ).toBeInTheDocument();
  });

  it('Should display the correct matrix generation date', async () => {
    testRenderer(<MockDayAheadMarketHeader />);

    expect(
      await screen.findByText(mockDayAheadMarketHeaderData.startDate, {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  describe('Download button tests', () => {
    it('Should render the download button', async () => {
      testRenderer(<MockDayAheadMarketHeader />);

      const downloadButton = await screen.findByRole('button', {
        name: /Download/i,
      });
      expect(downloadButton).toBeInTheDocument();
    });

    // eslint-disable-next-line jest/no-commented-out-tests
    // it('Should show loading state on click', async () => {
    //   testRenderer(<MockDayAheadMarketHeader />);

    //   const downloadButton = await screen.findByRole('button', {
    //     name: /Download/i,
    //   });
    //   fireEvent.click(downloadButton);

    //   const icons: HTMLElement[] = await screen.findAllByRole('img');
    //   const iconClassNames = icons.map((icon: HTMLElement) =>
    //     icon.getAttribute('class')
    //   );

    //   expect(iconClassNames).toContain('cogs-icon--animated-spinner');
    // });

    it('Should handle download click', async () => {
      testRenderer(<MockDayAheadMarketHeader />);

      const downloadButton = await screen.findByRole('button', {
        name: /Download/i,
      });
      fireEvent.click(downloadButton);

      expect(mockDownloadFunction).toBeCalled();
    });
  });

  describe('Shop quality assurance tests', () => {
    it('Should display download confirmation modal', async () => {
      testRenderer(<MockDayAheadMarketHeader show />);

      expect(await screen.findByTestId('confirm-download-modal')).toHaveClass(
        'focus-visible'
      );
    });

    it('Should close confirmation modal on cancel button click', async () => {
      testRenderer(<MockDayAheadMarketHeader show />);

      const cancelButton = await screen.findByRole('button', {
        name: /Cancel/i,
        hidden: true,
      });
      fireEvent.click(cancelButton);

      expect(
        await screen.findByTestId('confirm-download-modal')
      ).not.toHaveClass('focus-visible');
    });

    it('Should download bidmatrix on download anyway button click', async () => {
      testRenderer(<MockDayAheadMarketHeader show />);

      const downloadButton = await screen.findByRole('button', {
        name: /Download anyway/i,
        hidden: true,
      });
      fireEvent.click(downloadButton);

      expect(mockDownloadFunction).toBeCalled();
    });
  });
});
