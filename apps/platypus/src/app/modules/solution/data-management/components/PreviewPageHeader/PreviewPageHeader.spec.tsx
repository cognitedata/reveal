import { DataModelTransformation } from '@platypus/platypus-core';
import * as flags from '@platypus-app/flags';
import useTransformations from '@platypus-app/modules/solution/data-management/hooks/useTransformations';
import render from '@platypus-app/tests/render';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import noop from 'lodash/noop';

import { PreviewPageHeader } from './PreviewPageHeader';

jest.mock('@platypus-app/flags');

const mockedFlags = jest.mocked(flags);

mockedFlags.useManualPopulationFeatureFlag.mockReturnValue({
  isEnabled: true,
  isClientReady: undefined,
});
mockedFlags.useDataManagementDeletionFeatureFlag.mockReturnValue({
  isEnabled: true,
  isClientReady: undefined,
});
mockedFlags.useSuggestionsFeatureFlag.mockReturnValue({
  isEnabled: true,
  isClientReady: undefined,
});
mockedFlags.useTransformationsFeatureFlag.mockReturnValue(true);

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useTransformations'
);

type UseQuery = ({
  space,
  isEnabled,
  typeName,
  version,
}: {
  space: string;
  isEnabled: boolean;
  typeName: string;
  version: string;
}) => { data: DataModelTransformation[] | undefined };

/*
Cast useTransformations to a jest.MockedFn so that we don't get typescript complaints
about calling mockReturnValue on it. A better solution is to simply do:

const mockedUseTransformations = jest.mocked(useTransformations)

but then typescript will expect us to return every other property from useQuery aside
from data.
*/
const mockedUseTransformations =
  useTransformations as unknown as jest.MockedFn<UseQuery>;

jest.mock(
  '@platypus-app/modules/solution/data-management/components/TransformationDropdown',
  () => ({
    TransformationDropdown: () => 'Bulk population',
  })
);

jest.mock(
  '@platypus-app/modules/solution/data-management/components/BulkPopulationButton',
  () => ({
    BulkPopulationButton: () => 'Bulk population',
  })
);

describe('PreviewPageHeader', () => {
  it('Shows action buttons if there are no rows but there are transformations', () => {
    const mockTransformations: DataModelTransformation[] = [
      {
        destination: {
          instanceSpaceExternalId: 'imdb',
          modelExternalId: 'Movie_2',
          spaceExternalId: 'imdb',
          type: 'data_model_instances',
        },
        externalId: 't_imdb_movie_2_1',
        id: 2,
        name: 'IMDB Movie_2 1',
      },
    ];

    mockedUseTransformations.mockReturnValue({
      data: mockTransformations,
    });

    render(
      <PreviewPageHeader
        space="imdb"
        draftRowsCount={0}
        filteredRowsCount={null}
        isDeleteButtonDisabled={false}
        onAddTransformationClick={noop}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        onRefreshClick={noop}
        onSearchInputValueChange={noop}
        publishedRowsCount={0}
        onSuggestionsClick={noop}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        viewVersion="2"
      />
    );

    expect(screen.getByText(/add instance/i)).toBeTruthy();
    expect(screen.getByText(/bulk population/i)).toBeTruthy();
    expect(screen.getByLabelText(/delete/i)).toBeTruthy();
  });

  it('Shows action buttons if there are published rows', () => {
    mockedUseTransformations.mockReturnValue({
      data: [],
    });

    render(
      <PreviewPageHeader
        space="imdb"
        draftRowsCount={0}
        filteredRowsCount={null}
        isDeleteButtonDisabled={false}
        onAddTransformationClick={noop}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        onRefreshClick={noop}
        onSuggestionsClick={noop}
        onSearchInputValueChange={noop}
        publishedRowsCount={1}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        viewVersion="2"
      />
    );

    expect(screen.getByText(/add instance/i)).toBeTruthy();
    expect(screen.getByLabelText(/delete/i)).toBeTruthy();
  });

  it('Shows action buttons if there are draft rows', () => {
    mockedUseTransformations.mockReturnValue({
      data: [],
    });

    render(
      <PreviewPageHeader
        space="imdb"
        draftRowsCount={1}
        filteredRowsCount={null}
        isDeleteButtonDisabled={false}
        onAddTransformationClick={noop}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        onRefreshClick={noop}
        onSuggestionsClick={noop}
        onSearchInputValueChange={noop}
        publishedRowsCount={0}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        viewVersion="2"
      />
    );

    expect(screen.getByText(/add instance/i)).toBeTruthy();
    expect(screen.getByLabelText(/delete/i)).toBeTruthy();
  });

  it('Does not show action buttons if there are no rows or transformations', () => {
    mockedUseTransformations.mockReturnValue({
      data: [],
    });

    render(
      <PreviewPageHeader
        space="imdb"
        draftRowsCount={0}
        filteredRowsCount={null}
        isDeleteButtonDisabled={false}
        onAddTransformationClick={noop}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        onRefreshClick={noop}
        onSuggestionsClick={noop}
        onSearchInputValueChange={noop}
        publishedRowsCount={0}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        viewVersion="2"
      />
    );

    expect(screen.queryByText(/add instance/i)).toBeNull();
    expect(screen.queryByLabelText(/delete/i)).toBeNull();
  });

  it('Shows search input if there are published rows', () => {
    render(
      <PreviewPageHeader
        space="imdb"
        draftRowsCount={0}
        filteredRowsCount={null}
        isDeleteButtonDisabled={false}
        onAddTransformationClick={noop}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        onRefreshClick={noop}
        onSearchInputValueChange={noop}
        onSuggestionsClick={noop}
        publishedRowsCount={4}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        viewVersion="2"
      />
    );

    expect(screen.getByRole('searchbox')).toBeTruthy();
  });

  it('Does not show search input if there are draft rows but no published rows', () => {
    render(
      <PreviewPageHeader
        space="imdb"
        draftRowsCount={10}
        filteredRowsCount={null}
        isDeleteButtonDisabled={false}
        onAddTransformationClick={noop}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        onRefreshClick={noop}
        onSearchInputValueChange={noop}
        onSuggestionsClick={noop}
        publishedRowsCount={0}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        viewVersion="2"
      />
    );

    expect(screen.queryByRole('searchbox')).toBeNull();
  });

  it('Does not show transformations button if flag is disabled', () => {
    mockedUseTransformations.mockReturnValue({
      data: undefined,
    });

    // disable transformations feature flag for this test
    mockedFlags.useTransformationsFeatureFlag.mockReturnValueOnce(false);

    render(
      <PreviewPageHeader
        space="imdb"
        draftRowsCount={0}
        filteredRowsCount={null}
        isDeleteButtonDisabled={false}
        onAddTransformationClick={noop}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        onRefreshClick={noop}
        onSearchInputValueChange={noop}
        onSuggestionsClick={noop}
        publishedRowsCount={4}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        viewVersion="2"
      />
    );

    expect(screen.queryByText(/bulk population/i)).toBeNull();
    expect(screen.getByText(/add instance/i)).toBeTruthy();
  });
});
