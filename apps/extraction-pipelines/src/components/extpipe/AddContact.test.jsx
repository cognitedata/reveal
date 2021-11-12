import { AddContact } from 'components/extpipe/AddContact';
import { render } from 'utils/test';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedExtpipeContext } from 'utils/test/render';
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
} from 'utils/validation/extpipeSchemas';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';

describe('AddContact', () => {
  const mock = getMockResponse()[0];
  const dataSetMock = mockDataSetResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedExtpipeContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });
  test('Interact with component', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    sdkv3.get.mockResolvedValue({ data: mock });
    sdkv3.datasets.retrieve.mockResolvedValue([dataSetMock]);
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
    fireEvent.click(screen.getByText(ADD_CONTACT));
    expect(screen.getByLabelText(NAME_LABEL).value).toEqual('');
    expect(screen.getByLabelText(EMAIL_LABEL).value).toEqual('');
    expect(screen.getByLabelText(ROLE_LABEL).value).toEqual('');
  });
});
