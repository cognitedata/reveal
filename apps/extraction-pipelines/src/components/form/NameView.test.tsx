import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryCache } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { act } from 'react-test-renderer';
import { getMockResponse } from '../../utils/mockResponse';
import { render } from '../../utils/test';
import NameView from './NameView';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderQueryCacheIntegration,
} from '../../utils/test/render';
import DetailsModal from './viewEditIntegration/DetailsModal';

describe('<NameView />', () => {
  let queryCache: QueryCache;
  beforeEach(() => {
    queryCache = new QueryCache();
  });

  test('Edit - change - cancel', () => {
    const integration = getMockResponse()[0];
    const wrapper = renderQueryCacheIntegration(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    render(<NameView />, { wrapper });

    // click first edit btn
    const firstEditBtn = screen.getAllByText('Edit')[0];
    fireEvent.click(firstEditBtn);
    const inputEdit = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(inputEdit).toBeInTheDocument();

    // change value in input
    const newValue = 'New integration name something unique';
    fireEvent.change(inputEdit, { target: { value: newValue } });

    // input should still be displayed
    fireEvent.blur(inputEdit);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const saveBtn = screen.getByText('Save');
    const cancelBtn = screen.getByText('Cancel');
    expect(saveBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    // click cancel. resets to original value. no input field
    fireEvent.click(cancelBtn);
    const noCancelBtn = screen.queryByText('Cancel');
    expect(noCancelBtn).not.toBeInTheDocument();
    const originalValue = screen.getByText(integration.name);
    expect(originalValue).toBeInTheDocument();
  });

  test('Edit - change - save', async () => {
    const integration = getMockResponse()[0];
    const wrapper = renderQueryCacheIntegration(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    render(<NameView />, { wrapper });

    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.name); // assuming name is editable
    expect(nameInput).toBeInTheDocument();

    // change value in input
    const newValue = 'New integration name something unique';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);
    const newValueInput = screen.getByDisplayValue(newValue);
    expect(newValueInput).toBeInTheDocument();
    const warning = screen.getByTestId(`warning-icon-name`);
    expect(warning).toBeInTheDocument();

    // click save. new value saved. just display value
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);
    await waitFor(() => {
      const noSaveBtn = screen.queryByText('Save');
      expect(noSaveBtn).not.toBeInTheDocument();
    });
    const newValueForRow = screen.getByText(newValue);
    expect(newValueForRow).toBeInTheDocument();
  });

  test('Should call to get updated integration information when contact is saved', async () => {
    const integration = getMockResponse()[0];
    const integrationsResponse = getMockResponse()[1];
    sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });
    sdkv3.get.mockResolvedValue({ data: { items: [integrationsResponse] } });
    const cancelMock = jest.fn();
    const wrapper = renderQueryCacheIntegration(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      integration
    );
    act(() => {
      render(
        <DetailsModal
          visible
          onCancel={cancelMock}
          integration={integration}
        />,
        { wrapper }
      );
    });

    // click first edit btn
    const editRow = 0;
    const firstEditBtn = screen.getAllByText('Edit')[editRow];
    fireEvent.click(firstEditBtn);
    const nameInput = screen.getByDisplayValue(integration.name); // assuming name is editable

    // change value in input
    const newValue = 'Something unique';
    fireEvent.change(nameInput, { target: { value: newValue } });
    fireEvent.blur(nameInput);

    // click save. new value saved. just display value
    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
  });
});
