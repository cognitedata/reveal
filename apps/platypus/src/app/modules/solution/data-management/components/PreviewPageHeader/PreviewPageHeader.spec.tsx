import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import { PreviewPageHeader } from './PreviewPageHeader';
import { DataModelTransformation } from '@platypus/platypus-core';
import noop from 'lodash/noop';
import useTransformations from '@platypus-app/modules/solution/data-management/hooks/useTransformations';
import { UseQueryResult } from '@tanstack/react-query';

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useTransformations'
);

type UseQuery = ({
  dataModelExternalId,
  isEnabled,
  typeName,
  version,
}: {
  dataModelExternalId: string;
  isEnabled: boolean;
  typeName: string;
  version: string;
}) => { data: DataModelTransformation[] };

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
  '@platypus-app/modules/solution/data-management/components/TransformationDropdown/TransformationDropdown',
  () => ({
    TransformationDropdown: () => null,
  })
);

jest.mock(
  '@platypus-app/modules/solution/data-management/components/BulkPopulationButton/BulkPopulationButton',
  () => ({
    BulkPopulationButton: () => null,
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
        dataModelExternalId="imdb"
        draftRowsCount={0}
        isDeleteButtonDisabled={false}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        publishedRowsCount={0}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        version="2"
      />
    );

    expect(screen.getByText(/add instance/i)).toBeTruthy();
    expect(screen.getByLabelText(/delete/i)).toBeTruthy();
  });

  it('Shows action buttons if there are published rows', () => {
    mockedUseTransformations.mockReturnValue({
      data: [],
    });

    render(
      <PreviewPageHeader
        dataModelExternalId="imdb"
        draftRowsCount={0}
        isDeleteButtonDisabled={false}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        publishedRowsCount={1}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        version="2"
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
        dataModelExternalId="imdb"
        draftRowsCount={1}
        isDeleteButtonDisabled={false}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        publishedRowsCount={0}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        version="2"
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
        dataModelExternalId="imdb"
        draftRowsCount={0}
        isDeleteButtonDisabled={false}
        onCreateClick={noop}
        onDeleteClick={noop}
        onDraftRowsCountClick={noop}
        onPublishedRowsCountClick={noop}
        publishedRowsCount={0}
        shouldShowDraftRows
        shouldShowPublishedRows
        title="Lorem"
        typeName="Movie"
        version="2"
      />
    );

    expect(screen.queryByText(/add instance/i)).toBeNull();
    expect(screen.queryByLabelText(/delete/i)).toBeNull();
  });
});
