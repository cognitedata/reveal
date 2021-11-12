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
  EXTPIPE_EXTERNAL_ID_HEADING,
} from 'utils/constants';
import {
  CREATE_EXTPIPE_PAGE_PATH,
  withTenant,
} from 'routing/CreateRouteConfig';
import 'utils/test/windowLocation';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

describe.skip('Register', () => {
  window.location.href =
    'https://dev.fusion.cogniteapp.com/itera-int-green/extpipes/create?env=greenfield';

  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: withTenant(CREATE_EXTPIPE_PAGE_PATH),
    initRegisterExtpipe: {},
  };
  beforeEach(() => {
    sdkv3.post.mockResolvedValue({
      data: { items: [{ name: 'My extpipe', id: 123 }] },
    });

    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Renders', async () => {
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
    const name = 'My extpipe';
    fireEvent.change(nameInput, { target: { value: name } });

    expect(
      screen.getByLabelText(EXTPIPE_EXTERNAL_ID_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(DESCRIPTION_LABEL)).toBeInTheDocument();
  });
});
