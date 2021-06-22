import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import React from 'react';
import { screen } from '@testing-library/react';
import {
  BACK,
  EXTRACTION_PIPELINE_OVERVIEW,
  ADD_EXTRACTION_PIPELINE,
} from 'utils/constants';
import { renderRegisterContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { CREATE_INTEGRATION_PAGE_PATH } from 'routing/CreateRouteConfig';

describe('RegisterIntegrationLayout', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `${CREATE_INTEGRATION_PAGE_PATH}`,
    initRegisterIntegration: {},
  };

  test('Renders', () => {
    renderRegisterContext(
      <RegisterIntegrationLayout>
        <p>Im the content</p>
      </RegisterIntegrationLayout>,
      { ...props }
    );
    expect(screen.queryByText(BACK)).not.toBeInTheDocument();
    expect(screen.getByText(ADD_EXTRACTION_PIPELINE)).toBeInTheDocument();
    expect(screen.getByText(EXTRACTION_PIPELINE_OVERVIEW)).toBeInTheDocument();
  });
  test('Renders back btn if path provided', () => {
    renderRegisterContext(
      <RegisterIntegrationLayout>
        <p>Im the content</p>
      </RegisterIntegrationLayout>,
      { ...props }
    );
    expect(screen.getByText(ADD_EXTRACTION_PIPELINE)).toBeInTheDocument();
    expect(screen.getByText(EXTRACTION_PIPELINE_OVERVIEW)).toBeInTheDocument();
  });
});
