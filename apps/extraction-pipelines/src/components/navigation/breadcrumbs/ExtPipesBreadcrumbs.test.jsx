import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@extraction-pipelines/utils/test/render';
import { ExtPipesBreadcrumbs } from '@extraction-pipelines/components/navigation/breadcrumbs/ExtPipesBreadcrumbs';
import { EXTRACTION_PIPELINES_PATH } from '@extraction-pipelines/utils/baseURL';

describe('ExtPipesBreadcrumbs', () => {
  test('Renders', () => {
    renderWithRouter(<ExtPipesBreadcrumbs />, {
      route: `/itera-int-green/${EXTRACTION_PIPELINES_PATH}`,
    });
    expect(screen.getByTestId('cognite-data-fusion')).toBeInTheDocument();
    expect(screen.getByTestId('data-sets')).toBeInTheDocument();
    expect(screen.getByTestId('extraction-pipeline')).toBeInTheDocument();
  });
});
