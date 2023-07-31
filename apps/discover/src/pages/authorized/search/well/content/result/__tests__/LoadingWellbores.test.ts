import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { LOADING_TEXT } from '../../constants';
import { LoadingWellbores } from '../LoadingWellbores';

describe('Wellbores loader', () => {
  const page = (viewProps?: any) =>
    testRenderer(LoadingWellbores, undefined, viewProps);

  const defaultTestInit = async () => {
    return { ...page() };
  };

  it(`should render loading text.`, async () => {
    await defaultTestInit();
    const row = screen.getByText(LOADING_TEXT.trim(), { exact: false });
    expect(row).toBeInTheDocument();
  });
});
