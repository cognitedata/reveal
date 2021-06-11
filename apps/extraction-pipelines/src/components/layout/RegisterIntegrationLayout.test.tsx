import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import React from 'react';
import { NAME_PAGE_PATH, NAME_PATH } from 'routing/CreateRouteConfig';
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

describe('RegisterIntegrationLayout', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `${NAME_PATH}`,
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
      <RegisterIntegrationLayout backPath={NAME_PAGE_PATH}>
        <p>Im the content</p>
      </RegisterIntegrationLayout>,
      { ...props }
    );
    expect(screen.getByText(BACK)).toBeInTheDocument();
    expect(screen.getByText(ADD_EXTRACTION_PIPELINE)).toBeInTheDocument();
    expect(screen.getByText(EXTRACTION_PIPELINE_OVERVIEW)).toBeInTheDocument();
  });
});
