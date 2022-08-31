import React from 'react';
import { screen } from '@testing-library/react';
import { ExtpipeBreadcrumbs } from 'components/navigation/breadcrumbs/ExtpipeBreadcrumbs';
import { renderWithRouter } from 'utils/test/render';
import { getMockExtpipesWithDataSets } from 'utils/mockResponse';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';

describe('ExtpipeBreadcrumbs', () => {
  test('No extpipe info', () => {
    const mock = getMockExtpipesWithDataSets()[0];
    renderWithRouter(<ExtpipeBreadcrumbs />, {
      route: `/itera-int-green/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${mock.id}`,
    });
    expect(screen.getByTestId('cognite-data-fusion')).toBeInTheDocument();
    expect(screen.getByTestId('data-sets')).toBeInTheDocument();
    expect(screen.queryByText(mock.dataSet.name)).not.toBeInTheDocument();
    expect(screen.queryByText(mock.name)).not.toBeInTheDocument();
  });

  test.only('Renders breadcrumbs for extpipe page', () => {
    const mock = getMockExtpipesWithDataSets()[0];
    renderWithRouter(<ExtpipeBreadcrumbs extpipe={mock} />, {
      route: `/itera-int-green/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${mock.id}`,
    });
    expect(screen.getByTestId('cognite-data-fusion')).toBeInTheDocument();
    expect(screen.getByTestId('data-sets')).toBeInTheDocument();
    expect(screen.getByText(mock.name)).toBeInTheDocument();
    expect(screen.getByText(mock.dataSet.name)).toBeInTheDocument();
  });
  test('Renders breadcrumbs for extpipe health', () => {
    const mock = getMockExtpipesWithDataSets()[0];
    renderWithRouter(<ExtpipeBreadcrumbs extpipe={mock} />, {
      route: `/itera-int-green/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${mock.id}/health`,
    });
    expect(screen.getByTestId('cognite-data-fusion')).toBeInTheDocument();
    expect(screen.getByTestId('data-sets')).toBeInTheDocument();
    expect(screen.getByText(mock.name)).toBeInTheDocument();
    expect(screen.getByText(mock.dataSet.name)).toBeInTheDocument();
  });
});
