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
    expect(screen.getByText(CDF_LABEL)).toBeInTheDocument();
    expect(screen.getByText(DATA_SETS_LABEL)).toBeInTheDocument();
    expect(screen.getByText(EXTRACTION_PIPELINES)).toBeInTheDocument();
  });
});
