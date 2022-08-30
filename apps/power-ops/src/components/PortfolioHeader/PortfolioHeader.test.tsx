import { screen, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { configure, mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import {
  mockBidProcessResult,
  getMockBidProcessResult,
  getTestCogniteClient,
} from 'utils/test';
import { testRenderer } from 'utils/test/render';
import * as utils from 'utils/utils';
import { formatDate } from 'utils/utils';
import { DEFAULT_CONFIG } from '@cognite/power-ops-api-types';

import {
  PortfolioHeader,
  useBidMatrixProcessStartDate,
} from './PortfolioHeader';
import { getMockCdfEvents, mockCreatedTime } from './PortfolioHeader.mock';

configure({ adapter: new Adapter() });

const mockServer = setupServer(
  getMockCdfEvents(),
  getMockBidProcessResult(undefined)
);

describe('Portfolio header tests', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('Should render the price area name', async () => {
    testRenderer(<PortfolioHeader bidProcessResult={mockBidProcessResult} />);

    const priceAreaName = new RegExp(mockBidProcessResult.priceAreaName);
    expect(await screen.findByText(priceAreaName)).toBeInTheDocument();
  });

  it('Should calculate the correct start date of the matrix generation process', async () => {
    const startDate = formatDate(
      mockCreatedTime,
      mockBidProcessResult.marketConfiguration?.timezone ||
        DEFAULT_CONFIG.TIME_ZONE
    );

    const TestComponent: React.FC = () => {
      const { startDate } = useBidMatrixProcessStartDate(
        mockBidProcessResult.bidProcessExternalId!,
        getTestCogniteClient(),
        mockBidProcessResult.marketConfiguration?.timezone ||
          DEFAULT_CONFIG.TIME_ZONE
      );
      return <div>{startDate}</div>;
    };
    testRenderer(<TestComponent />);
    expect(await screen.findByText(startDate)).toBeInTheDocument();
  });

  describe('Download button tests', () => {
    const handleDownload = jest.spyOn(utils, 'downloadBidMatrices');

    it('Should render the download button', () => {
      testRenderer(<PortfolioHeader bidProcessResult={mockBidProcessResult} />);

      const downloadButton = screen.getByRole('button', { name: /Download/i });
      expect(downloadButton).toBeInTheDocument();
    });

    it('Should show loading state on click', () => {
      const wrapper = mount(
        <PortfolioHeader bidProcessResult={mockBidProcessResult} />
      );

      const button = wrapper.findWhere((node) => {
        return node.type() === 'button' && node.text() === 'Download';
      });
      button.simulate('click');

      button.hasClass('cogs-btn-loading');
    });

    it('Should handle click', () => {
      testRenderer(<PortfolioHeader bidProcessResult={mockBidProcessResult} />);

      const downloadButton = screen.getByRole('button', { name: /Download/i });
      fireEvent.click(downloadButton);

      expect(handleDownload).toBeCalled();
    });
  });
});
