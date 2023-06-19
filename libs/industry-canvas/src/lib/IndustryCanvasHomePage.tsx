import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { formatDistance, format } from 'date-fns';
import { omit, sortBy } from 'lodash';

import { Button, Table, InputExp, toast, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from './common';
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
import { useTranslation } from './hooks/useTranslation';
import { useIndustryCanvasContext } from './IndustryCanvasContext';
import { getCanvasLink } from './utils/getCanvasLink';

export const IndustryCanvasHomePage = () => {
  const { canvases, isCreatingCanvas, createCanvas } =
    useIndustryCanvasContext();
  const { t } = useTranslation();
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
        aria-label={t(
          translationKeys.COMMON_CREATE_CANVAS,
          'Create new canvas'
        )}
        onClick={() => {
          createCanvas({
            canvasAnnotations: [],
            container: EMPTY_FLEXIBLE_LAYOUT,
          }).then(({ externalId }) => navigate(getCanvasLink(externalId)));
        }}
      >
        {t(translationKeys.COMMON_CREATE_CANVAS, 'Create new canvas')}
      </Button>
    </div>
  );

  const renderCopyCanvasLinkButton = (row: CanvasDocumentWithUserProfile) => (
    <Tooltip
      content={t(translationKeys.COMMON_CANVAS_LINK_COPY, 'Copy canvas link')}
    >
      <Button
        type="ghost"
        icon="Link"
        aria-label={t(
          translationKeys.COMMON_CANVAS_LINK_COPY,
          'Copy canvas link'
        )}
        onClick={(ev) => {
          ev.stopPropagation();
          navigator.clipboard.writeText(
            `${window.location.origin}${getCanvasLink(row.externalId)}`
          );
          toast.success(
            t(
              translationKeys.CANVAS_LINK_COPIED,
              'Canvas link copied to clipboard.'
            ),
            {
              toastId: `copy-canvas-${row.externalId}`,
              position: TOAST_POSITION,
            }
          );
        }}
      />
    </Tooltip>
  );

  const renderDeleteCanvasButton = (row: CanvasDocumentWithUserProfile) => (
    <Tooltip content={t(translationKeys.COMMON_CANVAS_DELETE, 'Delete canvas')}>
      <Button
        type="ghost-destructive"
        icon="Delete"
        aria-label={t(translationKeys.COMMON_CANVAS_DELETE, 'Delete canvas')}
        onClick={(ev) => {
          ev.stopPropagation();
          setCanvasToDelete(
            omit(row, [
              'createdByUserProfile',
              'createdAtDate',
              'updatedAtDate',
            ])
          );
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
            <h1>Industrial Canvas</h1>
            <span>
              {t(
                translationKeys.HOMEPAGE_IC_DESCRIPTION,
                'Search, explore and manage canvases.'
              )}
            </span>
          </div>
          {renderNewCanvasButton()}
        </HomeHeader>
        <CanvasListContainer>
          <SearchCanvasInput
            placeholder={t(
              translationKeys.HOMEPAGE_TABLE_SEARCH_PLACEHOLDER,
              'Browse canvases'
            )}
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
                Header: t(translationKeys.HOMEPAGE_TABLE_NAME_COLUMN, 'Name'),
                accessor: 'name',
              },
              {
                Header: t(
                  translationKeys.HOMEPAGE_TABLE_UPDATED_AT_COLUMN,
                  'Updated at'
                ),
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
                Header: t(
                  translationKeys.HOMEPAGE_TABLE_CREATED_AT_COLUMN,
                  'Created at'
                ),
                accessor: 'createdAtDate',
                Cell: ({ value }: { value: Date }): JSX.Element => (
                  <span>{format(value, 'yyyy-MM-dd')}</span>
                ),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - sortType is not defined in the Cogs table types, but works just fine. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1530
                sortType: 'datetime',
              },
              {
                Header: t(
                  translationKeys.HOMEPAGE_TABLE_CREATED_BY_COLUMN,
                  'Created by'
                ),
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
