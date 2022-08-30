import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithRouter } from 'utils/test/render';
import {
  CDF_LABEL,
  DATA_SETS_LABEL,
  EXTRACTION_PIPELINES,
} from "common/test"
import { ExtPipesBreadcrumbs } from 'components/navigation/breadcrumbs/ExtPipesBreadcrumbs';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';

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
