import React from 'react';
import { getMockResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  MAX_DESC_LENGTH,
  NAME_REQUIRED,
} from 'utils/validation/integrationSchemas';
import { ContactBtnTestIds } from 'components/form/ContactsView';
import TextAreaField from 'components/integration/TextAreaField';
import * as yup from 'yup';

describe('TextAreaField', () => {
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
      <TextAreaField
        integration={mock}
        name="description"
        defaultValues={{ description: mock.description }}
        schema={yup.object().shape({
          description: yup
            .string()
            .max(
              10,
              `Description can only contain ${MAX_DESC_LENGTH} characters`
            ),
        })}
        label="Name"
        maxCount={10}
      />,
      { wrapper: wrapper.wrapper }
    );
    const input = screen.getByText(mock.description);
    fireEvent.click(input);
    const tooLong = 'eeeeeeeeeeeee';
    fireEvent.change(screen.getByDisplayValue(mock.description), {
      target: { value: tooLong },
    });
    fireEvent.click(
      screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}description`)
    );
    await waitFor(() => {
      screen.getByText(/only contain/i);
    });
    expect(screen.getByText(`${tooLong.length}/10`)).toBeInTheDocument();
    const newName = 'Some name';
    fireEvent.change(screen.getByDisplayValue('eeeeeeeeeeeee'), {
      target: { value: newName },
    });
    await waitFor(() => {
      screen.getByDisplayValue(newName);
    });
    fireEvent.click(
      screen.getByTestId(`${ContactBtnTestIds.SAVE_BTN}description`)
    );
    await waitFor(() => {
      expect(screen.queryByText(NAME_REQUIRED)).not.toBeInTheDocument();
    });
  });
});
