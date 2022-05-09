import { screen, render, fireEvent } from '@testing-library/react';
import * as utils from 'utils/utils';
import { configure, mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { mockPriceArea } from 'test-utils/mockPriceArea';

import { PortfolioHeader } from '../PortfolioHeader';

configure({ adapter: new Adapter() });

describe('Portfolio header tests', () => {
  it('Should render the price area name', async () => {
    render(<PortfolioHeader priceArea={mockPriceArea} />);

    const priceAreaName = new RegExp(mockPriceArea.name);
    expect(await screen.findByText(priceAreaName)).toBeInTheDocument();
  });

  it('Should render the correct timestamp for matrix generation', async () => {
    render(<PortfolioHeader priceArea={mockPriceArea} />);

    const startDate = new Date(
      mockPriceArea.totalMatrixes[0].startTime
    ).toLocaleString();
    const timestamp = new RegExp(startDate);

    expect(await screen.findByText(timestamp)).toBeInTheDocument();
  });

  describe('Download button tests', () => {
    const handleDownload = jest.spyOn(utils, 'downloadBidMatrices');

    it('Should render the download button', () => {
      render(<PortfolioHeader priceArea={mockPriceArea} />);

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
      render(<PortfolioHeader priceArea={mockPriceArea} />);

      const downloadButton = screen.getByRole('button', { name: /Download/i });
      fireEvent.click(downloadButton);

      expect(handleDownload).toBeCalled();
    });
  });
});
