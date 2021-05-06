import { METADATA_DESCRIPTION_LABEL } from 'utils/constants';

import {
  META_DESC_REQUIRED,
  metaDescriptionSchema,
} from 'utils/validation/integrationSchemas';
import { TestIds } from 'components/integration/EditPartContacts';
import React from 'react';
import { getMockResponse } from 'utils/mockResponse';
import { render } from 'utils/test';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { EditField } from 'components/integration/EditField';

describe('EditField', () => {
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
    const meta = {
      description: 'Docs link',
      content: 'https://docs.cognite.coms',
    };
    const updateFunction = jest.fn();
    updateFunction.mockReturnValue({
      id: '1',
      project: PROJECT_ITERA_INT_GREEN,
      items: [
        {
          id: `1`,
          update: {
            metadata: {
              set: { documentationLink: 'https://docs.cognite.com' },
            },
          },
        },
      ],
    });
    render(
      <EditField
        name="metadata"
        index={0}
        field="description"
        label={METADATA_DESCRIPTION_LABEL}
        schema={metaDescriptionSchema}
        defaultValues={{ description: meta?.description }}
        updateFunction={updateFunction}
      />,
      {
        wrapper: wrapper.wrapper,
      }
    );
    expect(screen.getByText(meta.description)).toBeInTheDocument();
    fireEvent.click(screen.getByText(meta.description));
    const noDesc = '';
    fireEvent.change(screen.getByDisplayValue(meta.description), {
      target: { value: noDesc },
    });
    fireEvent.click(screen.getByTestId(`${TestIds.SAVE_BTN}0description`));
    await waitFor(() => {
      screen.getByText(META_DESC_REQUIRED);
    });
    const newDesc = 'Documentation link';
    fireEvent.change(screen.getByLabelText(METADATA_DESCRIPTION_LABEL), {
      target: { value: newDesc },
    });
    fireEvent.click(screen.getByTestId(`${TestIds.SAVE_BTN}0description`));
    await waitFor(() => {
      expect(
        screen.queryByTestId(`${TestIds.SAVE_BTN}0description`)
      ).not.toBeInTheDocument();
    });
  });
});
