import EditableField from 'components/integration/EditableField';
import React from 'react';
import { getMockResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { NAME_REQUIRED, nameSchema } from 'utils/validation/integrationSchemas';
import { ContactBtnTestIds } from 'components/form/ContactsView';

describe('EditableField', () => {
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
  test('Interact', async () => {
    sdkv3.post.mockResolvedValue({ data: { items: [mock] } });
    render(
      <EditableField
        integration={mock}
        name="name"
        defaultValues={{ name: mock.name }}
        schema={nameSchema}
        label="Name"
      />,
      { wrapper: wrapper.wrapper }
    );
    const input = screen.getByText(mock.name);
    fireEvent.click(input);
    fireEvent.change(screen.getByDisplayValue(mock.name), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}name`));
    await waitFor(() => {
      screen.getByText(NAME_REQUIRED);
    });
    const newName = 'Some name';
    fireEvent.change(screen.getByDisplayValue(''), {
      target: { value: newName },
    });
    await waitFor(() => {
      screen.getByDisplayValue(newName);
    });
    fireEvent.click(screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}name`));
    await waitFor(() => {
      expect(screen.queryByText(NAME_REQUIRED)).not.toBeInTheDocument();
    });
  });
});
