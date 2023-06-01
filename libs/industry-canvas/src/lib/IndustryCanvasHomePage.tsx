import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { formatDistance, format } from 'date-fns';
import { sortBy } from 'lodash';

import { Button, Table, InputExp, toast, Tooltip } from '@cognite/cogs.js';

import CanvasDeletionModal from './components/CanvasDeletionModal';
import { SEARCH_QUERY_PARAM_KEY, TOAST_POSITION } from './constants';
import { EMPTY_FLEXIBLE_LAYOUT } from './hooks/constants';
import useCanvasDeletion from './hooks/useCanvasDeletion';
import useCanvasesWithUserProfiles, {
  CanvasDocumentWithUserProfile,
} from './hooks/useCanvasesWithUserProfiles';
import useCanvasSearch from './hooks/useCanvasSearch';
import { useQueryParameter } from './hooks/useQueryParameter';
import useTableState from './hooks/useTableState';
import {
  useIndustryCanvasContext,
  IndustryCanvasProvider,
} from './IndustryCanvasContext';
import { UserProfileProvider } from './UserProfileProvider';
import { getCanvasLink } from './utils/getCanvasLink';

const IndustryCanvasHome = () => {
  const { canvases, isCreatingCanvas, createCanvas } =
    useIndustryCanvasContext();
  const navigate = useNavigate();
  const { canvasesWithUserProfiles } = useCanvasesWithUserProfiles({
    canvases,
  });
  const { queryString: searchString, setQueryString: setSearchString } =
    useQueryParameter({
      key: SEARCH_QUERY_PARAM_KEY,
    });
  const { filteredCanvases } = useCanvasSearch({
    canvases: canvasesWithUserProfiles,
    searchString,
  });
  const sortedCanvases = useMemo(
    () => sortBy(filteredCanvases, 'updatedAtDate').reverse(),
    [filteredCanvases]
  );
  const {
    canvasToDelete,
    setCanvasToDelete,
    onDeleteCanvasConfirmed,
    isDeletingCanvas,
  } = useCanvasDeletion();
  const { initialTableState, onTableStateChange } = useTableState();

  const renderNewCanvasButton = () => (
    <div>
      <Button
        icon="Plus"
        iconPlacement="left"
        type="primary"
        loading={isCreatingCanvas}
        aria-label="Create new canvas"
        onClick={() => {
          createCanvas({
            canvasAnnotations: [],
            container: EMPTY_FLEXIBLE_LAYOUT,
          }).then(({ externalId }) => navigate(getCanvasLink(externalId)));
        }}
      >
        Create new canvas
      </Button>
    </div>
  );

  const renderCopyCanvasLinkButton = (row: CanvasDocumentWithUserProfile) => (
    <Tooltip content="Copy canvas link">
      <Button
        type="ghost"
        icon="Link"
        aria-label="Copy canvas link"
        onClick={(ev) => {
          ev.stopPropagation();
          navigator.clipboard.writeText(
            `${window.location.origin}${getCanvasLink(row.externalId)}`
          );
          toast.success(`Canvas link copied to clipboard`, {
            toastId: `copy-canvas-${row.externalId}`,
            position: TOAST_POSITION,
          });
        }}
      />
    </Tooltip>
  );

  const renderDeleteCanvasButton = (row: CanvasDocumentWithUserProfile) => (
    <Tooltip content="Delete canvas">
      <Button
        type="ghost-destructive"
        icon="Delete"
        aria-label="Delete canvas"
        onClick={(ev) => {
          ev.stopPropagation();
          setCanvasToDelete(row);
        }}
      />
    </Tooltip>
  );

  return (
    <>
      <CanvasDeletionModal
        canvas={canvasToDelete}
        onCancel={() => setCanvasToDelete(undefined)}
        onDeleteCanvas={onDeleteCanvasConfirmed}
        isDeleting={isDeletingCanvas}
      />
      <div>
        <HomeHeader>
          <div>
            <h1>Industry Canvas</h1>
            <span>Search, explore and manage canvases.</span>
          </div>
          {renderNewCanvasButton()}
        </HomeHeader>
        <CanvasListContainer>
          <SearchCanvasInput
            placeholder="Browse canvases"
            fullWidth
            value={searchString}
            icon="Search"
            onChange={(e) => setSearchString(e.target.value)}
          />
          <Table<CanvasDocumentWithUserProfile>
            initialState={initialTableState}
            onStateChange={onTableStateChange}
            onRowClick={(row) =>
              navigate(
                getCanvasLink(row.original.externalId, {
                  [SEARCH_QUERY_PARAM_KEY]: searchString,
                })
              )
            }
            columns={[
              {
                Header: 'Name',
                accessor: 'name',
              },
              {
                Header: 'Updated at',
                accessor: 'updatedAtDate',
                Cell: ({ value }: { value: Date }): JSX.Element => (
                  <span>
                    {formatDistance(value, new Date(), {
                      addSuffix: true,
                    })}
                  </span>
                ),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - sortType is not defined in the Cogs table types, but works just fine. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1530
                sortType: 'datetime',
              },
              {
                Header: 'Created at',
                accessor: 'createdAtDate',
                Cell: ({ value }: { value: Date }): JSX.Element => (
                  <span>{format(value, 'yyyy-MM-dd')}</span>
                ),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - sortType is not defined in the Cogs table types, but works just fine. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1530
                sortType: 'datetime',
              },
              {
                Header: 'Created by',
                accessor: (row) =>
                  row.createdByUserProfile?.displayName ?? 'Unknown user',
              },
              {
                id: 'row-options',
                accessor: (row) => (
                  <>
                    {renderCopyCanvasLinkButton(row)}
                    {renderDeleteCanvasButton(row)}
                  </>
                ),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - disableSortBy works just fine, but the type definition is wrong. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1530
                disableSortBy: true,
              },
            ]}
            rowKey={(canvas) => canvas.externalId}
            dataSource={sortedCanvases}
          />
        </CanvasListContainer>
      </div>
    </>
  );
};

export const IndustryCanvasHomePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider>
        <IndustryCanvasProvider>
          <IndustryCanvasHome />
        </IndustryCanvasProvider>
      </UserProfileProvider>
    </QueryClientProvider>
  );
};

const HomeHeader = styled.div`
  align-items: center;
  background: rgba(64, 120, 240, 0.06);
  justify-content: space-between;
  height: 120px;
  width: 100%;
  display: flex;
  padding-left: 156px;
  padding-right: 156px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }
`;

const CanvasListContainer = styled.div`
  padding: 16px 156px;
  tbody {
    cursor: pointer;
  }
`;

const SearchCanvasInput = styled(InputExp)`
  background-color: rgba(83, 88, 127, 0.08);
  margin-bottom: 16px;
`;
