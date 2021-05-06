import { render } from 'utils/test';
import { getMockResponse } from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  ADD_ROW,
  METADATA_CONTENT_LABEL,
  METADATA_DESCRIPTION_LABEL,
  SAVE,
} from 'utils/constants';
import {
  META_CONTENT_REQUIRED,
  META_DESC_REQUIRED,
} from 'utils/validation/integrationSchemas';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { AddMetadata } from 'components/inputs/metadata/AddMetadata';

describe('AddMetadata', () => {
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
    sdkv3.post.mockResolvedValue({ data: { items: [getMockResponse()[0]] } });
    sdkv3.get.mockResolvedValue({ data: getMockResponse()[0] });
    render(<AddMetadata />, {
      wrapper: wrapper.wrapper,
    });
    fireEvent.click(screen.getByText(ADD_ROW));
    expect(
      screen.getByLabelText(METADATA_DESCRIPTION_LABEL)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(METADATA_CONTENT_LABEL)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(SAVE));
    await waitFor(() => {
      screen.getByText(META_DESC_REQUIRED);
    });
    expect(screen.getByText(META_CONTENT_REQUIRED)).toBeInTheDocument();
    const desc = 'Documentation link';
    fireEvent.change(screen.getByLabelText(METADATA_DESCRIPTION_LABEL), {
      target: { value: desc },
    });
    const content = 'https://docs.cogntie.com';
    fireEvent.change(screen.getByLabelText(METADATA_CONTENT_LABEL), {
      target: { value: content },
    });
    fireEvent.click(screen.getByLabelText(SAVE));
    await waitFor(() => {
      screen.getByText(ADD_ROW);
    });
  });
});
