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
import { EditMetaData } from 'components/inputs/metadata/EditMetaData';

describe('ContactSection', () => {
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

  test('Interact with component', async () => {
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
