import { getMockResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { TestIds } from 'components/integration/EditPartContacts';
import { METADATA_DESC_HEADING } from 'utils/constants';
import {
  EditMetaData,
  EditMetaDataView,
} from 'components/inputs/metadata/EditMetaData';

function fillKeyValue(key, value) {
  fireEvent.change(screen.getAllByDisplayValue('')[0], {
    target: { value: key },
  });
  fireEvent.change(screen.getByDisplayValue(''), {
    target: { value },
  });
}

describe('Edit metadata tests', () => {
  const mock = getMockResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });

  const clickAddFields = () => {
    screen.getByText('Add fields').click();
  };

  test('Component testing', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const initialMetadata = { weather: 'Sunny' };
    render(
      <EditMetaDataView
        initialMetadata={initialMetadata}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    fireEvent.change(screen.getByDisplayValue('Sunny'), {
      target: { value: 'Very rainy' },
    });
    clickAddFields();
    fillKeyValue('Wind speed', '14 m/s');
    clickAddFields();
    screen.getByText('Confirm').click();
    expect(onConfirm).toHaveBeenCalledWith({
      weather: 'Very rainy',
      windSpeed: '14 m/s',
    });
  });

  test.todo('Should handle user writing same metadata field name twice');

  test('Handle deleting row, and saving with no metadata-fields set', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <EditMetaDataView
        initialMetadata={{ weather: 'Sunny' }}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    screen.getByLabelText('Remove metadata row').click();
    screen.getByText('Confirm').click();
    expect(onConfirm).toHaveBeenCalledWith({});
  });

  test('Handle whitespaces in value & key gracefully', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <EditMetaDataView
        initialMetadata={{}}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    fillKeyValue(' temperature ', ' low ');
    screen.getByText('Confirm').click();
    expect(onConfirm).toHaveBeenCalledWith({ temperature: 'low' });
  });

  test.skip('Interact with component', async () => {
    sdkv3.get.mockResolvedValueOnce({ data: mock });
    render(<EditMetaData />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(mock.metadata?.documentation);
    });
    expect(screen.getByText(METADATA_DESC_HEADING)).toBeInTheDocument();
    expect(screen.getByText(mock.metadata?.documentation)).toBeInTheDocument();
    expect(screen.getByText(mock.metadata?.sourceSystem)).toBeInTheDocument();
    fireEvent.click(screen.getByText(mock.metadata?.sourceSystem));
    await waitFor(() => {
      screen.getByDisplayValue(mock.metadata?.sourceSystem);
    });
    const source = 'Other source';
    fireEvent.change(screen.getByDisplayValue(mock.metadata?.sourceSystem), {
      target: { value: source },
    });
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    sdkv3.get.mockResolvedValue({
      data: {
        ...mock,
        metadata: {
          sourceSystem: source,
          documentation: mock.metadata?.documentation,
        },
      },
    });
    fireEvent.click(screen.getByTestId(`${TestIds.SAVE_BTN}0content`));
    await waitFor(() => {
      expect(
        screen.queryByTestId(`${TestIds.SAVE_BTN}0content`)
      ).not.toBeInTheDocument();
    });
  });
});
