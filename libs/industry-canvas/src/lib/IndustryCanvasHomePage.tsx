import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { formatDistance, format } from 'date-fns';
import { partition } from 'lodash';
import { useDebounce } from 'use-debounce';

import {
  Button,
  Table,
  InputExp,
  toast,
  Icon,
  Tooltip,
  Body,
  Loader,
  SegmentedControl,
} from '@cognite/cogs.js';

import { translationKeys } from './common';
import {
  AddResourceToCanvasModal,
  AddResourcesToCanvasType,
  AddResourcesToCanvasOnOkArgs,
} from './components/AddResourceToCanvasModal';
import CanvasDeletionModal from './components/CanvasDeletionModal';
import { SEARCH_QUERY_PARAM_KEY, TOAST_POSITION } from './constants';
import { useCallbackOnce } from './hooks/useCallbackOnce';
import useCanvasDeletion from './hooks/useCanvasDeletion';
import useCanvasesWithUserProfiles, {
  CanvasDocumentWithUserProfile,
} from './hooks/useCanvasesWithUserProfiles';
import useCanvasSearch from './hooks/useCanvasSearch';
import { useQueryParameter } from './hooks/useQueryParameter';
import useTableState from './hooks/useTableState';
import { useTranslation } from './hooks/useTranslation';
import { useIndustryCanvasContext } from './IndustryCanvasContext';
import { CanvasVisibility } from './services/IndustryCanvasService';
import { isFdmInstanceContainerReference } from './types';
import { UserProfile, useUserProfile } from './UserProfileProvider';
import { addIdToContainerReference } from './utils/addIdToContainerReference';
import { createDuplicateCanvas } from './utils/createDuplicateCanvas';
import { addDimensionsToContainerReferencesIfNotExists } from './utils/dimensions';
import { getCanvasLink } from './utils/getCanvasLink';
import {
  getCanvasVisibilityIcon,
  getCanvasVisibilityTooltipText,
} from './utils/getCanvasVisibility';

const SEARCH_DEBOUNCE_MS = 200;

export const IndustryCanvasHomePage = () => {
  const {
    canvases,
    isCreatingCanvas,
    isListingCanvases,
    createCanvas,
    visibilityFilter,
    setVisibilityFilter,
    saveCanvas,
    getCanvasById,
    initializeWithContainerReferences,
    hasConsumedInitializeWithContainerReferences,
    setHasConsumedInitializeWithContainerReferences,
  } = useIndustryCanvasContext();
  const { userProfile } = useUserProfile();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canvasesWithUserProfiles } = useCanvasesWithUserProfiles({
    canvases,
  });
  const { setQueryString } = useQueryParameter({ key: SEARCH_QUERY_PARAM_KEY });
  const [searchString, setSearchString] = useState<string>('');
  const [debouncedSearchString] = useDebounce(searchString, SEARCH_DEBOUNCE_MS);

  const { filteredCanvases } = useCanvasSearch({
    canvases: canvasesWithUserProfiles,
    searchString: debouncedSearchString,
  });
  useEffect(() => {
    setQueryString(debouncedSearchString);
  }, [debouncedSearchString, setQueryString]);
  const {
    canvasToDelete,
    setCanvasToDelete,
    onDeleteCanvasConfirmed,
    isDeletingCanvas,
  } = useCanvasDeletion();
  const { initialTableState, onTableStateChange } = useTableState();

  const getUpdatedByUserString = (
    currentUserProfile: UserProfile | undefined
  ) => {
    if (
      currentUserProfile === undefined ||
      currentUserProfile.displayName === undefined
    ) {
      return t(translationKeys.BY_UNKNOWN_USER, 'by unknown user');
    }

    if (userProfile.userIdentifier === currentUserProfile.userIdentifier) {
      return t(translationKeys.BY_ME, 'by me');
    }

    return t(translationKeys.BY_USER, {
      user: currentUserProfile.displayName,
      defaultValue: 'by {{user}}',
    });
  };

  const getCreatedByName = (createdByUserProfile: UserProfile | undefined) => {
    if (
      createdByUserProfile === undefined ||
      createdByUserProfile.displayName === undefined
    ) {
      return t(translationKeys.UNKNOWN_USER, 'Unknown user');
    }

    if (userProfile.userIdentifier === createdByUserProfile.userIdentifier) {
      return t(translationKeys.ME, 'Me');
    }

    return createdByUserProfile.displayName;
  };

  const handleOnOk = useCallback(
    async (args: AddResourcesToCanvasOnOkArgs) => {
      const containerReferencesWithIds = args.containerReferences.map(
        addIdToContainerReference
      );

      if (args.type === AddResourcesToCanvasType.NEW_CANVAS) {
        const [fdmInstanceContainerReferences, containerReferences] = partition(
          containerReferencesWithIds,
          isFdmInstanceContainerReference
        );
        const { externalId } = await createCanvas({
          name: args.name,
          containerReferences,
          fdmInstanceContainerReferences,
        });
        navigate(getCanvasLink(externalId));
        setHasConsumedInitializeWithContainerReferences(true);
        return;
      }

      if (args.type === AddResourcesToCanvasType.EXISTING_CANVAS) {
        const existingCanvas = await getCanvasById(args.externalId);

        if (existingCanvas === undefined) {
          toast.error(
            t(
              translationKeys.MODAL_ADD_RESOURCE_TO_CANVAS_CANVAS_NOT_FOUND,
              'Unable to find canvas with id {{id}}. Please refresh the page and try again.'
            ),
            {
              position: TOAST_POSITION,
            }
          );
          return;
        }

        const [fdmInstanceContainerReferences, containerReferences] = partition(
          addDimensionsToContainerReferencesIfNotExists(
            containerReferencesWithIds,
            existingCanvas.data
          ),
          isFdmInstanceContainerReference
        );

        await saveCanvas({
          ...existingCanvas,
          data: {
            ...existingCanvas.data,
            containerReferences: [
              ...existingCanvas.data.containerReferences,
              ...containerReferences,
            ],
            fdmInstanceContainerReferences: [
              ...existingCanvas.data.fdmInstanceContainerReferences,
              ...fdmInstanceContainerReferences,
            ],
          },
        });
        navigate(getCanvasLink(existingCanvas.externalId));
        setHasConsumedInitializeWithContainerReferences(true);
        return;
      }
    },
    [
      createCanvas,
      getCanvasById,
      navigate,
      saveCanvas,
      setHasConsumedInitializeWithContainerReferences,
      t,
    ]
  );

  const renderNewCanvasButton = () => (
    <div>
      <Button
        data-testid="create-new-canvas-button"
        icon="Add"
        iconPlacement="left"
        type="primary"
        disabled={isListingCanvases}
        loading={isCreatingCanvas}
        aria-label={t(
          translationKeys.COMMON_CREATE_CANVAS,
          'Create new canvas'
        )}
        onClick={async () => {
          const { externalId } = await createCanvas();
          navigate(getCanvasLink(externalId));
        }}
      >
        {t(translationKeys.COMMON_CREATE_CANVAS, 'Create new canvas')}
      </Button>
    </div>
  );

  const renderVisibilityIndicatorButton = (
    row: CanvasDocumentWithUserProfile
  ) => {
    const { visibility } = row;
    return (
      <Tooltip
        content={getCanvasVisibilityTooltipText(t, visibility)}
        position="left"
      >
        <Icon
          type={getCanvasVisibilityIcon(visibility)}
          aria-label={getCanvasVisibilityTooltipText(t, visibility)}
        />
      </Tooltip>
    );
  };

  const handleDuplicateCanvasClick =
    useCallbackOnce<CanvasDocumentWithUserProfile>(async (selectedCanvas) => {
      const canvas = await getCanvasById(selectedCanvas.externalId);

      const { externalId } = await createDuplicateCanvas({
        canvas,
        createCanvas,
        t,
      });

      navigate(getCanvasLink(externalId));
    });

  const renderDuplicateCanvasButton = (row: CanvasDocumentWithUserProfile) => (
    <Tooltip
      content={t(translationKeys.COMMON_CANVAS_DUPLICATE, 'Duplicate canvas')}
    >
      <Button
        type="ghost"
        icon="Duplicate"
        disabled={isCreatingCanvas}
        aria-label={t(
          translationKeys.COMMON_CANVAS_DUPLICATE,
          'Duplicate canvas'
        )}
        onClick={(ev) => {
          ev.stopPropagation();
          handleDuplicateCanvasClick(row);
        }}
      />
    </Tooltip>
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
            <div>
              <b>
                {t(
                  translationKeys.CANVAS_LINK_COPIED_TITLE,
                  'Canvas link copied'
                )}
              </b>
              <p>
                {t(
                  translationKeys.CANVAS_LINK_COPIED_SUB_TITLE,
                  'Canvas link successfully copied to your clipboard'
                )}
              </p>
            </div>,
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
    <Tooltip
      content={
        row.createdByUserProfile?.userIdentifier !== userProfile.userIdentifier
          ? t(
              translationKeys.COMMON_CANVAS_DELETE_DISABLED,
              'A canvas can only be deleted by its owner'
            )
          : t(translationKeys.COMMON_CANVAS_DELETE, 'Delete canvas')
      }
    >
      <Button
        type="ghost-destructive"
        icon="Delete"
        aria-label={
          row.createdByUserProfile?.userIdentifier !==
          userProfile.userIdentifier
            ? t(
                translationKeys.COMMON_CANVAS_DELETE_DISABLED,
                'A canvas can only be deleted by its owner'
              )
            : t(translationKeys.COMMON_CANVAS_DELETE, 'Delete canvas')
        }
        disabled={
          row.createdByUserProfile?.userIdentifier !==
          userProfile.userIdentifier
        }
        onClick={(ev) => {
          ev.stopPropagation();
          setCanvasToDelete(row);
        }}
      />
    </Tooltip>
  );

  return (
    <>
      <div>
        <HomeHeader data-testid="homeHeader">
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
        {isListingCanvases ? (
          <LoaderWrapper>
            <Loader
              darkMode={false}
              infoTitle={t(
                translationKeys.LOADING_CANVASES,
                'Loading canvases...'
              )}
            />
          </LoaderWrapper>
        ) : (
          <CanvasListContainer>
            <SearchAreaWrapper>
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
              <SegmentedControl currentKey={visibilityFilter}>
                {/* Here when 'private' is selected, we only show the canvases that are created/owned by me? */}
                <SegmentedControl.Button
                  key={CanvasVisibility.PRIVATE}
                  icon={getCanvasVisibilityIcon(CanvasVisibility.PRIVATE)}
                  onClick={() => setVisibilityFilter(CanvasVisibility.PRIVATE)}
                >
                  {t(translationKeys.VISIBILITY_PRIVATE, 'Private')}
                </SegmentedControl.Button>

                <SegmentedControl.Button
                  key={CanvasVisibility.PUBLIC}
                  icon={getCanvasVisibilityIcon(CanvasVisibility.PUBLIC)}
                  onClick={() => setVisibilityFilter(CanvasVisibility.PUBLIC)}
                >
                  {t(translationKeys.VISIBILITY_PUBLIC, 'Public')}
                </SegmentedControl.Button>

                <SegmentedControl.Button
                  key={CanvasVisibility.ALL}
                  onClick={() => setVisibilityFilter(CanvasVisibility.ALL)}
                >
                  {t(translationKeys.VISIBILITY_ALL, 'All')}
                </SegmentedControl.Button>
              </SegmentedControl>
            </SearchAreaWrapper>
            <Table<CanvasDocumentWithUserProfile>
              initialState={initialTableState}
              onStateChange={onTableStateChange}
              onRowClick={(row) =>
                navigate(
                  getCanvasLink(row.original.externalId, {
                    [SEARCH_QUERY_PARAM_KEY]: debouncedSearchString,
                  })
                )
              }
              columns={[
                {
                  id: 'row-visibility',
                  accessor: (row) => (
                    <>{renderVisibilityIndicatorButton(row)}</>
                  ),
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore - disableSortBy works just fine, but the type definition is wrong. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1530
                  disableSortBy: true,
                },
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
                  Cell: ({ row }): JSX.Element => {
                    const rowData = row.original;

                    const lastUpdatedString = formatDistance(
                      rowData.updatedAtDate,
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    );

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{lastUpdatedString}</span>
                        <Body level={3} muted>
                          {getUpdatedByUserString(rowData.updatedByUserProfile)}
                        </Body>
                      </div>
                    );
                  },
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
                  accessor: (row) => getCreatedByName(row.createdByUserProfile),
                },
                {
                  id: 'row-options',
                  accessor: (row) => (
                    <>
                      {renderDuplicateCanvasButton(row)}
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
              dataSource={filteredCanvases}
            />
          </CanvasListContainer>
        )}
      </div>
      <CanvasDeletionModal
        canvas={canvasToDelete}
        onCancel={() => setCanvasToDelete(undefined)}
        onDeleteCanvas={onDeleteCanvasConfirmed}
        isDeleting={isDeletingCanvas}
      />
      <AddResourceToCanvasModal
        containerReferences={initializeWithContainerReferences}
        canvases={canvases}
        isVisible={
          !hasConsumedInitializeWithContainerReferences &&
          initializeWithContainerReferences !== undefined
        }
        onCancel={() => setHasConsumedInitializeWithContainerReferences(true)}
        onOk={handleOnOk}
      />
    </>
  );
};

const LoaderWrapper = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

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

const SearchAreaWrapper = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 16px;

  .cogs-inputexp-container {
    flex: 1;
    margin-right: 16px;
  }
`;

const SearchCanvasInput = styled(InputExp)`
  background-color: rgba(83, 88, 127, 0.08);
`;
