import {
  CONTACT_NAME_REQUIRED,
  contactNameSchema,
} from 'utils/validation/integrationSchemas';
import {
  EditPartContacts,
  TestIds,
} from 'components/integration/EditPartContacts';
import React from 'react';
import { getMockResponse } from 'utils/mockResponse';
import { render } from 'utils/test';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';

describe('EditPartContacts', () => {
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
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    render(
      <EditPartContacts
        integration={mock}
        name="contacts"
        index={0}
        field="name"
        label="Name"
        schema={contactNameSchema}
        defaultValues={{ name: mock.contacts[0].name }}
      />,
      {
        wrapper: wrapper.wrapper,
      }
    );
    expect(screen.getByText(mock.contacts[0].name)).toBeInTheDocument();
    fireEvent.click(screen.getByText(mock.contacts[0].name));
    const noName = '';
    fireEvent.change(screen.getByDisplayValue(mock.contacts[0].name), {
      target: { value: noName },
    });
    fireEvent.click(screen.getByTestId(`${TestIds.SAVE_BTN}0name`));
    await waitFor(() => {
      screen.getByText(CONTACT_NAME_REQUIRED);
    });
    const newName = 'New name';
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: newName },
    });
    fireEvent.click(screen.getByTestId(`${TestIds.SAVE_BTN}0name`));
    await waitFor(() => {
      expect(
        screen.queryByTestId(`${TestIds.SAVE_BTN}0name`)
      ).not.toBeInTheDocument();
    });
  });
});
