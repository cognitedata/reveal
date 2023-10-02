import {
  useManualPopulationFeatureFlag,
  useTransformationsFeatureFlag,
} from '@platypus-app/flags';
import render from '@platypus-app/tests/render';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import noop from 'lodash/noop';

import { NoRowsOverlay } from './NoRowsOverlay';

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useTransformations',
  () => {
    return () => ({ data: [] });
  }
);

jest.mock(
  '@platypus-app/modules/solution/data-management/components/BulkPopulationButton',
  () => ({
    BulkPopulationButton: () => 'Populate in bulk',
  })
);

jest.mock('@platypus-app/flags');

// use jest.mocked() so we don't get a typescript error when we call mockReturnValue etc
const mockedUseManualPopulationFeatureFlag = jest.mocked(
  useManualPopulationFeatureFlag
);
const mockedUseTransformationsFeatureFlag = jest.mocked(
  useTransformationsFeatureFlag
);

describe('NoRowsOverlay', () => {
  it('Shows correct buttons and copy if manual population and transformations are enabled', () => {
    mockedUseManualPopulationFeatureFlag.mockReturnValue({
      isEnabled: true,
      isClientReady: undefined,
    });
    mockedUseTransformationsFeatureFlag.mockReturnValue(true);

    render(
      <NoRowsOverlay space="abc" onLoadDataClick={noop} typeName="Person" />
    );

    expect(screen.getByText(/add instance/i)).toBeTruthy();
    expect(screen.getByText(/populate in bulk/i)).toBeTruthy();
    expect(
      screen.getByText(
        /Do you want to start by adding data manually in the table or load data in bulk through transformations?/i
      )
    ).toBeTruthy();
  });

  it('Shows only manual population button and copy if only that flag is enabled', () => {
    mockedUseManualPopulationFeatureFlag.mockReturnValue({
      isEnabled: true,
      isClientReady: undefined,
    });
    mockedUseTransformationsFeatureFlag.mockReturnValue(false);

    render(
      <NoRowsOverlay
        space="abc"
        onLoadDataClick={noop}
        typeName="Person"
        version="2"
      />
    );

    expect(screen.getByText(/add instance/i)).toBeTruthy();
    expect(screen.queryByText(/populate in bulk/i)).toBeNull();
    expect(
      screen.getByText(
        /Do you want to start by adding data manually in the table?/i
      )
    ).toBeTruthy();
  });

  it('Shows only transformations button and copy if only that flag is enabled', () => {
    mockedUseManualPopulationFeatureFlag.mockReturnValue({
      isEnabled: false,
      isClientReady: undefined,
    });
    mockedUseTransformationsFeatureFlag.mockReturnValue(true);

    render(
      <NoRowsOverlay
        space="abc"
        onLoadDataClick={noop}
        typeName="Person"
        version="2"
      />
    );

    expect(screen.queryByText(/add instance/i)).toBeNull();
    expect(screen.getByText(/populate in bulk/i)).toBeTruthy();
    expect(
      screen.getByText(
        /Do you want to start by loading data in bulk through transformations?/i
      )
    ).toBeTruthy();
  });

  it('Shows no buttons or copy if no flags are enabled', () => {
    mockedUseManualPopulationFeatureFlag.mockReturnValue({
      isEnabled: false,
      isClientReady: undefined,
    });
    mockedUseTransformationsFeatureFlag.mockReturnValue(false);

    render(
      <NoRowsOverlay
        space="abc"
        onLoadDataClick={noop}
        typeName="Person"
        version="2"
      />
    );

    expect(screen.queryByText(/add instance/i)).toBeNull();
    expect(screen.queryByText(/populate in bulk/i)).toBeNull();
    expect(screen.queryByText(/Do you want to start/i)).toBeNull();
  });
});
