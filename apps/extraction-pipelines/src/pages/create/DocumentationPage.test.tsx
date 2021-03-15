import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import {
  DOCUMENTATION_PAGE_PATH,
  RAW_TABLE_PAGE_PATH,
} from 'routing/CreateRouteConfig';
import { renderRegisterContext } from 'utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { BACK, REGISTER } from 'utils/constants';
import DocumentationPage, {
  DESCRIPTION_LABEL,
  INTEGRATION_DOCUMENTATION_HEADING,
} from 'pages/create/DocumentationPage';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';

describe('DocumentationPage', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: DOCUMENTATION_PAGE_PATH,
    initRegisterIntegration: {},
  };
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Renders', () => {
    renderRegisterContext(<DocumentationPage />, { ...props });
    expect(
      screen.getByText(INTEGRATION_DOCUMENTATION_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(DESCRIPTION_LABEL)).toBeInTheDocument();
  });

  test('Loads from context and interacts with form', async () => {
    const mockIntegration = {
      id: 123,
      description: 'This is my description of the integration',
    };
    renderRegisterContext(<DocumentationPage />, {
      ...props,
      initRegisterIntegration: mockIntegration,
    });
    expect(
      screen.getByDisplayValue(mockIntegration.description)
    ).toBeInTheDocument();
    const nameInput = screen.getByLabelText(DESCRIPTION_LABEL);
    const description = 'Im entering a description for the integration';
    fireEvent.change(nameInput, { target: { value: description } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(description)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(REGISTER));
    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
    expect(sdkv3.post).toHaveBeenCalledWith(
      '/api/playground/projects/itera-int-green/integrations/update',
      {
        data: {
          items: [
            {
              id: `${mockIntegration.id}`,
              update: { description: { set: description } },
            },
          ],
        },
        withCredentials: true,
      }
    );
  });

  test('Back btn path', () => {
    renderRegisterContext(<DocumentationPage />, { ...props });
    const back = screen.getByText(BACK);
    const linkPath = back.getAttribute('href');
    expect(linkPath.includes(RAW_TABLE_PAGE_PATH)).toEqual(true);
  });
});
