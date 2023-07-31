import { render } from 'utils/test';
import { fixtureDataTransferDataTable } from '__fixtures__/fixtureDataTransfers';
import { screen, fireEvent } from '@testing-library/react';

import { DetailViewButton } from '../DetailView/DetailViewButton';

describe('datatransfers/components/detailview', () => {
  describe('DetailViewButton', () => {
    it('Triggers the onCall event and pass in the correct record', () => {
      const mockHandleClick = jest.fn();

      const [record] = fixtureDataTransferDataTable;

      render(<DetailViewButton record={record} onClick={mockHandleClick} />);

      const detailViewButton = screen.getByText('View');
      expect(detailViewButton).toBeInTheDocument();

      fireEvent.click(detailViewButton);

      expect(mockHandleClick).toBeCalledTimes(1);
      expect(mockHandleClick).toBeCalledWith(record);
    });

    it('Returns the empty component if revisons are empty', () => {
      const mockHandleClick = jest.fn();
      render(
        <DetailViewButton
          record={{ revisions: [] } as any}
          onClick={mockHandleClick}
        />
      );
      const detailViewButton = screen.queryByText('View');

      expect(detailViewButton).not.toBeInTheDocument();
      expect(mockHandleClick).not.toBeCalled();
    });
  });
});
