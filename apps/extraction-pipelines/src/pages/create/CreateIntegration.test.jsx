import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { QueryClient } from 'react-query';
import { renderRegisterContext } from 'utils/test/render';
import {
  CREATE,
  DESCRIPTION_LABEL,
  EXT_PIPE_NAME_HEADING,
  INTEGRATION_EXTERNAL_ID_HEADING,
} from 'utils/constants';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import 'utils/test/windowLocation';
import CreateIntegration from 'pages/create/CreateIntegration';
import {
  EXTERNAL_ID_REQUIRED,
  NAME_REQUIRED,
} from 'utils/validation/integrationSchemas';
import { useRawDBAndTables } from 'hooks/useRawDBAndTables';
import { databaseListMock, mockDataSetResponse } from 'utils/mockResponse';
import { CREATE_INTEGRATION_PAGE_PATH } from 'routing/CreateRouteConfig';
// eslint-disable-next-line
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

jest.mock('hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});

describe('CreateIntegration', () => {
  window.location.href =
    'https://dev.fusion.cogniteapp.com/itera-int-green/integrations/create/name?env=greenfield';
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `${CREATE_INTEGRATION_PAGE_PATH}`,
    initRegisterIntegration: {},
  };

  beforeEach(() => {
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
  });

  test('Renders stored value', () => {
    const name = 'Preset name';
    const withName = { ...props, initRegisterIntegration: { name } };
    renderRegisterContext(<CreateIntegration />, { ...withName });
    const nameInput = screen.getByLabelText(EXT_PIPE_NAME_HEADING);
    expect(nameInput).toBeInTheDocument();
    const externalIdInput = screen.getByLabelText(
      INTEGRATION_EXTERNAL_ID_HEADING
    );
    expect(externalIdInput).toBeInTheDocument();
    const descriptionInput = screen.getByLabelText(DESCRIPTION_LABEL);
    expect(descriptionInput).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    useRawDBAndTables.mockReturnValue({
      isLoading: false,
      data: databaseListMock,
    });
    renderRegisterContext(<CreateIntegration />, { ...props });
    const nameInput = screen.getByLabelText(EXT_PIPE_NAME_HEADING);
    expect(nameInput).toBeInTheDocument();
    const saveBtn = screen.getByText(CREATE);
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText(NAME_REQUIRED)).toBeInTheDocument();
    });
    expect(screen.getByText(EXTERNAL_ID_REQUIRED)).toBeInTheDocument();

    const integrationName = 'My integration';
    fireEvent.change(nameInput, { target: { value: integrationName } });
    expect(screen.getByDisplayValue(integrationName)).toBeInTheDocument();

    const externalId = 'external_id_1';
    fireEvent.change(screen.getByLabelText(INTEGRATION_EXTERNAL_ID_HEADING), {
      target: { value: externalId },
    });
    expect(screen.getByDisplayValue(externalId)).toBeInTheDocument();

    /*
    expect(screen.getAllByText(ADD_MORE_INFO_HEADING).length).toEqual(2);
    fireEvent.click(screen.getByRole('tab'));
    await waitFor(() => {
      expect(screen.getByRole('tabpanel').classList).toContain(
        'rc-collapse-content-active'
      );
    });
    expect(screen.getByLabelText(TableHeadings.SCHEDULE)).toBeVisible();
    expect(screen.getByLabelText(DetailFieldNames.SOURCE)).toBeVisible();
    expect(screen.getByText(DEFINE_METADATA_LABEL)).toBeVisible();
    expect(screen.getByText(TableHeadings.CONTACTS)).toBeVisible();
    expect(screen.getByText(DetailFieldNames.RAW_TABLE)).toBeVisible();
    expect(
      screen.getByLabelText(DetailFieldNames.DOCUMENTATION)
    ).toBeInTheDocument();
    await waitFor(() => {
      screen.getByLabelText(DBS_LABEL);
    });
    expect(screen.getByLabelText(DBS_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(TABLES_LABEL)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab'));
    await waitFor(() => {
      expect(screen.getByRole('tabpanel').classList).toContain(
        'rc-collapse-content-inactive'
      );
    });
    */
  });

  test('Interact data set id', async () => {
    useRawDBAndTables.mockReturnValue({
      isLoading: false,
      data: databaseListMock,
    });
    // eslint-disable-next-line
    const { container } = renderRegisterContext(<CreateIntegration />, {
      ...props,
    });
    sdkv3.datasets.list.mockResolvedValue(mockDataSetResponse());

    const nameInput = screen.getByLabelText(EXT_PIPE_NAME_HEADING);

    const integrationName = 'My integration';
    fireEvent.change(nameInput, { target: { value: integrationName } });
    expect(screen.getByDisplayValue(integrationName)).toBeInTheDocument();

    const externalId = 'external_id_1';
    fireEvent.change(screen.getByLabelText(INTEGRATION_EXTERNAL_ID_HEADING), {
      target: { value: externalId },
    });
    expect(screen.getByDisplayValue(externalId)).toBeInTheDocument();
  });
});
