import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import {
  Body,
  Button,
  Flex,
  Graphic,
  Loader,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import Suitebar from 'components/suitebar';
import { SuiteMenu } from 'components/menus';
import { OverviewContainer, NoItemsContainer } from 'styles/common';
import { useDispatch, useSelector } from 'react-redux';
import {
  getSuiteByKey,
  getSuitesTableState,
  suitesByKey,
} from 'store/suites/selectors';
import { getGroupsState, isAdmin } from 'store/groups/selectors';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Suite } from 'store/suites/types';
import { UserSpaceState } from 'store/userSpace/types';
import { getUserSpace } from 'store/userSpace/selectors';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { fetchImageUrls } from 'store/suites/thunks';
import * as actions from 'store/suites/actions';
import { useMetrics } from 'utils/metrics';
import { getBoardsGridLayoutItems } from 'store/layout/selectors';
import { getModalState } from 'store/modals/selectors';
import { GridLayout } from 'store/layout/types';
import isEmpty from 'lodash/isEmpty';
import SuiteBreadcrumb from 'components/navigation/SuiteBreadcrumb';
import { SubSuiteTile } from 'components/tiles';

import { ContainerTitle, DescriptionContainer, StyledTitle } from './elements';
import SuiteOverviewGrid from './SuiteOverviewGrid';

const SuiteOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useDispatch<RootDispatcher>();
  const client = useContext(CdfClientContext);
  const { filter: groupsFilter } = useSelector(getGroupsState);
  const [editingLayout, setEditingLayout] = useState(false);
  const admin = useSelector(isAdmin);
  const canEdit = admin && !groupsFilter?.length;

  const {
    loading: suitesLoading,
    loaded: suitesLoaded,
    imageUrls: {
      loading: imgUrlsLoading,
      loaded: imgUrlsLoaded,
      failed: imgUrlsFailed,
    },
  } = useSelector(getSuitesTableState);
  const { loading: userSpaceLoading }: UserSpaceState =
    useSelector(getUserSpace);

  const {
    modalConfig: { modalType: currentOpenedModal },
  } = useSelector(getModalState);

  const suite: Suite = useSelector(getSuiteByKey(id)) as Suite;

  const byKey = useSelector(suitesByKey);

  const metrics = useMetrics('SuiteOverview');

  const {
    title,
    color,
    boards = [],
    suites: childSuites,
    parent: parentSuite,
  } = suite || {};
  const [sidebarToggled, setSidebarToggled] = useState(false);

  const boardLayout = useSelector(getBoardsGridLayoutItems(boards));
  const [layout, setLayout] = useState<GridLayout>({});

  const gridComponentRef = useRef(null);

  const hasSuiteThumbnails = childSuites?.some(
    (childKey) => !!byKey[childKey]?.imageFileId
  );

  useEffect(() => {
    if (currentOpenedModal) {
      return;
    }
    if (!!boards?.length && !isEmpty(boardLayout)) {
      setLayout(boardLayout);
    }
  }, [suite?.key, currentOpenedModal, boards]);

  useEffect(() => {
    // On suite change, cancel any layout editing
    setEditingLayout(false);
    const toggle = () => {
      setSidebarToggled((prev) => !prev);
    };
    // Emitted by LeftSidebar
    document.addEventListener('sidebar-toggle', toggle);
    return () => document.removeEventListener('sidebar-toggle', toggle);
  }, [suite?.key, currentOpenedModal]);

  // gather all image file ids to fetch them all at once
  const imageFileIds = useMemo(() => {
    // boards images
    return boards
      .reduce<string[]>((acc, board) => {
        if (board.imageFileId) {
          acc.push(board.imageFileId);
        }
        return acc;
      }, [])
      .concat(
        hasSuiteThumbnails
          ? // sub-suites images
            childSuites!.reduce<string[]>((acc, child) => {
              if (byKey[child].imageFileId) {
                acc.push(byKey[child].imageFileId as string);
              }
              return acc;
            }, [])
          : []
      );
  }, [boards, hasSuiteThumbnails, childSuites, byKey]);

  useEffect(() => {
    const unsubscribe = history.listen(() => {
      // when select another suite
      dispatch(actions.clearImgUrls());
    });
    return unsubscribe;
  }, [history, dispatch]);

  useEffect(() => {
    const fetchImgUrls = async (ids: string[]) => {
      await dispatch(fetchImageUrls(client, ids));
    };
    if (
      imageFileIds?.length &&
      !imgUrlsLoaded &&
      !imgUrlsLoading &&
      !imgUrlsFailed
    ) {
      fetchImgUrls(imageFileIds);
    }
  }, [
    imageFileIds,
    imgUrlsLoading,
    imgUrlsLoaded,
    imgUrlsFailed,
    client,
    dispatch,
  ]);

  const saveCurrentLayout = () => {
    (gridComponentRef.current as any)?.saveGrid();
  };

  if (!suite) {
    return <Redirect to="/" />;
  }

  if (!suitesLoaded) {
    return null;
  }

  if (suitesLoading || userSpaceLoading) {
    return <Loader />;
  }

  const handleOpenModal = (
    modalType: ModalType,
    modalProps: { suiteItem?: Suite; parentSuiteItem?: Suite }
  ) => {
    const { suiteItem, parentSuiteItem } = modalProps;
    metrics.track(`Select_${modalType}:Create_Subsuite`, {
      suiteKey: ((suiteItem || parentSuiteItem) as Suite).key,
      suite: ((suiteItem || parentSuiteItem) as Suite).title,
    });
    dispatch(modalOpen({ modalType, modalProps }));
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const Header = () => (
    <>
      {parentSuite ? (
        <SuiteBreadcrumb suiteKey={suite.key} />
      ) : (
        <>
          <SuiteAvatar color={color} title={title} />
          <Title as={StyledTitle} level={5}>
            {title}
          </Title>
        </>
      )}
      {canEdit && <SuiteMenu suiteItem={suite} />}
    </>
  );

  const renderActionButtons = () => {
    const actionButtons = [];
    if (canEdit) {
      actionButtons.push(
        <Tooltip content="Add subsuite">
          <Button
            key="add-subsuite"
            type="ghost"
            icon="Folder"
            iconPlacement="left"
            onClick={() =>
              handleOpenModal('EditSuite', { parentSuiteItem: suite })
            }
          >
            <span className="action-button-text">Add subsuite</span>
          </Button>
        </Tooltip>
      );
      actionButtons.push(
        <Tooltip content="Add board">
          <Button
            key="add-board"
            type="ghost"
            icon="Add"
            iconPlacement="left"
            onClick={() => handleOpenModal('EditBoard', { suiteItem: suite })}
          >
            <span className="action-button-text">Add board</span>
          </Button>
        </Tooltip>
      );
    }
    if (canEdit) {
      if (editingLayout) {
        actionButtons.push(
          <Tooltip content="Save layout">
            <Button
              key="save-layout"
              type="primary"
              icon="Grid"
              iconPlacement="left"
              onClick={() => {
                saveCurrentLayout();
                setEditingLayout(false);
                metrics.track('Save_Layout', {
                  suiteKey: suite.key,
                  suite: suite.title,
                });
              }}
            >
              <span className="action-button-text">Save layout</span>
            </Button>
          </Tooltip>
        );
      } else {
        actionButtons.push(
          <Tooltip content="Edit layout">
            <Button
              key="edit-layout"
              type="ghost"
              icon="Grid"
              iconPlacement="left"
              onClick={() => {
                setEditingLayout(true);
                metrics.track('Edit_Layout', {
                  suiteKey: suite.key,
                  suite: suite.title,
                });
              }}
            >
              <span className="action-button-text">Edit layout</span>
            </Button>
          </Tooltip>
        );
      }
    }
    return actionButtons;
  };

  return (
    <>
      <Suitebar
        leftCustomHeader={<Header />}
        actionsPanel={renderActionButtons()}
      />
      <OverviewContainer key={`${sidebarToggled}`}>
        {suite.description && (
          <DescriptionContainer>
            <ContainerTitle>
              <Title level={6}>Description</Title>
            </ContainerTitle>
            <Body>{suite.description}</Body>
          </DescriptionContainer>
        )}
        {childSuites?.length ? (
          <>
            <ContainerTitle>
              <Title level={6}>Subsuites</Title>
            </ContainerTitle>
            <Flex wrap="wrap">
              {childSuites?.map((subSuiteKey) => (
                <SubSuiteTile
                  suiteKey={subSuiteKey}
                  key={subSuiteKey}
                  size={hasSuiteThumbnails ? 'medium' : 'small'}
                  handleClick={() =>
                    metrics.track('Suite_Click:Subsuite', {
                      subSuiteKey,
                      suite: suite.title,
                    })
                  }
                  menu={
                    canEdit ? (
                      <SuiteMenu
                        suiteItem={byKey[subSuiteKey]}
                        className="subsuite-tile-menu"
                      />
                    ) : undefined
                  }
                />
              ))}
            </Flex>
          </>
        ) : null}
        {!boards?.length ? (
          <NoItemsContainer>
            <Graphic type="DataKits" />
            <Title level={5}>No boards added to suite yet</Title>
          </NoItemsContainer>
        ) : (
          <>
            <ContainerTitle>
              <Title level={6}>Boards</Title>
            </ContainerTitle>
            <SuiteOverviewGrid
              boards={boards}
              suite={suite}
              layout={layout}
              editingLayout={editingLayout}
              ref={gridComponentRef}
            />
          </>
        )}
      </OverviewContainer>
    </>
  );
};

export default React.memo(SuiteOverview);
