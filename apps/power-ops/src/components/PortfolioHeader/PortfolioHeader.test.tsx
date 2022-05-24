import { screen, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { configure, mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import {
  mockPriceArea,
  getMockPriceArea,
  getTestCogniteClient,
} from 'utils/test';
import { testRenderer } from 'utils/test/render';
import * as utils from 'utils/utils';
import { formatDate } from 'utils/utils';

import {
  PortfolioHeader,
  useBidMatrixProcessStartDate,
} from './PortfolioHeader';
import { getMockCdfEvents, mockCreatedTime } from './PortfolioHeader.mock';

configure({ adapter: new Adapter() });

const mockServer = setupServer(getMockCdfEvents(), getMockPriceArea(undefined));

describe('Portfolio header tests', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('Should render the price area name', async () => {
    testRenderer(<PortfolioHeader priceArea={mockPriceArea} />);

    const priceAreaName = new RegExp(mockPriceArea.name);
    expect(await screen.findByText(priceAreaName)).toBeInTheDocument();
  });

  it('Should calculate the correct start date of the matrix generation process', async () => {
    const startDate = formatDate(mockCreatedTime, true);

    const TestComponent: React.FC = () => {
      const { startDate } = useBidMatrixProcessStartDate(
        mockPriceArea.bidProcessExternalId!,
        getTestCogniteClient()
      );
      return <div>{startDate}</div>;
    };
    testRenderer(<TestComponent />);
    expect(await screen.findByText(startDate)).toBeInTheDocument();
  });

  describe('Download button tests', () => {
    const handleDownload = jest.spyOn(utils, 'downloadBidMatrices');

    it('Should render the download button', () => {
      testRenderer(<PortfolioHeader priceArea={mockPriceArea} />);

      const downloadButton = screen.getByRole('button', { name: /Download/i });
      expect(downloadButton).toBeInTheDocument();
    });

    it('Should show loading state on click', () => {
      const wrapper = mount(<PortfolioHeader priceArea={mockPriceArea} />);

      const button = wrapper.findWhere((node) => {
        return node.type() === 'button' && node.text() === 'Download';
      });
      button.simulate('click');

      button.hasClass('cogs-btn-loading');
    });

    it('Should handle click', () => {
      testRenderer(<PortfolioHeader priceArea={mockPriceArea} />);

      const downloadButton = screen.getByRole('button', { name: /Download/i });
      fireEvent.click(downloadButton);

      expect(handleDownload).toBeCalled();
    });
  });
});
