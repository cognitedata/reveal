import { QueryClient } from 'react-query';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { renderRegisterContext } from 'utils/test/render';
import Create from 'pages/create/Create';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import {
  DESCRIPTION_LABEL,
  EXT_PIPE_NAME_HEADING,
  INTEGRATION_EXTERNAL_ID_HEADING,
} from 'utils/constants';
import {
  CREATE_INTEGRATION_PAGE_PATH,
  withTenant,
} from 'routing/CreateRouteConfig';
import 'utils/test/windowLocation';
// eslint-disable-next-line
import { usePermissions } from '@cognite/sdk-react-query-hooks';

jest.mock('@cognite/sdk-react-query-hooks', () => {
  return {
    usePermissions: jest.fn(),
  };
});
describe('Register', () => {
  window.location.href =
    'https://dev.fusion.cogniteapp.com/itera-int-green/integrations/create?env=greenfield';

  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: withTenant(CREATE_INTEGRATION_PAGE_PATH),
    initRegisterIntegration: {},
  };
  beforeEach(() => {
    sdkv3.post.mockResolvedValue({
      data: { items: [{ name: 'My integration', id: 123 }] },
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Renders', async () => {
    usePermissions.mockReturnValue({ isLoading: false, data: true });
    renderRegisterContext(
      <React.Suspense fallback="This is the fallback">
        <Create />
      </React.Suspense>,
      { ...props }
    );

    // // name page
    await waitFor(() => {
      screen.getByLabelText(EXT_PIPE_NAME_HEADING);
    });
    const nameInput = await screen.findByLabelText(EXT_PIPE_NAME_HEADING);
    const name = 'My integration';
    fireEvent.change(nameInput, { target: { value: name } });

    expect(
      screen.getByLabelText(INTEGRATION_EXTERNAL_ID_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(DESCRIPTION_LABEL)).toBeInTheDocument();
  });
});
