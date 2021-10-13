import React from 'react';
import { screen } from '@testing-library/react';
import { IntegrationBreadcrumbs } from 'components/navigation/breadcrumbs/IntegrationBreadcrumbs';
import { renderWithRouter } from 'utils/test/render';
import { getMockIntegrationsWithDataSets } from 'utils/mockResponse';
import { CDF_LABEL, DATA_SETS_LABEL } from 'utils/constants';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';

describe('IntegrationBreadcrumbs', () => {
  test('No integration info', () => {
    const mock = getMockIntegrationsWithDataSets()[0];
    renderWithRouter(<IntegrationBreadcrumbs />, {
      route: `/itera-int-green/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${mock.id}`,
    });
    expect(screen.getByText(CDF_LABEL)).toBeInTheDocument();
    expect(screen.getByText(DATA_SETS_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(mock.dataSet.name)).not.toBeInTheDocument();
    expect(screen.queryByText(mock.name)).not.toBeInTheDocument();
  });

  test('Renders breadcrumbs for integration page', () => {
    const mock = getMockIntegrationsWithDataSets()[0];
    renderWithRouter(<IntegrationBreadcrumbs integration={mock} />, {
      route: `/itera-int-green/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${mock.id}`,
    });
    expect(screen.getByText(CDF_LABEL)).toBeInTheDocument();
    expect(screen.getByText(DATA_SETS_LABEL)).toBeInTheDocument();
    expect(screen.getByText(mock.name)).toBeInTheDocument();
    expect(screen.getByText(mock.dataSet.name)).toBeInTheDocument();
  });
  test('Renders breadcrumbs for integration health', () => {
    const mock = getMockIntegrationsWithDataSets()[0];
    renderWithRouter(<IntegrationBreadcrumbs integration={mock} />, {
      route: `/itera-int-green/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${mock.id}/health`,
    });
    expect(screen.getByText(CDF_LABEL)).toBeInTheDocument();
    expect(screen.getByText(DATA_SETS_LABEL)).toBeInTheDocument();
    expect(screen.getByText(mock.name)).toBeInTheDocument();
    expect(screen.getByText(mock.dataSet.name)).toBeInTheDocument();
  });
});
