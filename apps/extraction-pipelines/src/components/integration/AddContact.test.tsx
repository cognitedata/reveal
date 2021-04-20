import { AddContact } from 'components/integration/AddContact';
import { render } from 'utils/test';
import { getMockResponse } from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  ADD_CONTACT,
  EMAIL_LABEL,
  NAME_LABEL,
  ROLE_LABEL,
  SAVE,
} from 'utils/constants';
import {
  CONTACT_EMAIL_REQUIRED,
  CONTACT_NAME_REQUIRED,
} from 'utils/validation/integrationSchemas';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';

describe('AddContact', () => {
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
    render(<AddContact />, {
      wrapper: wrapper.wrapper,
    });
    fireEvent.click(screen.getByText(ADD_CONTACT));
    expect(screen.getByLabelText(NAME_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(EMAIL_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(ROLE_LABEL)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(SAVE));
    await waitFor(() => {
      screen.getByText(CONTACT_NAME_REQUIRED);
    });
    expect(screen.getByText(CONTACT_EMAIL_REQUIRED)).toBeInTheDocument();
    const name = 'The name';
    fireEvent.change(screen.getByLabelText(NAME_LABEL), {
      target: { value: name },
    });
    const email = 'test@test.no';
    fireEvent.change(screen.getByLabelText(EMAIL_LABEL), {
      target: { value: email },
    });
    fireEvent.click(screen.getByLabelText(SAVE));
    await waitFor(() => {
      screen.getByText(ADD_CONTACT);
    });
  });
});
