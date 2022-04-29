import React, { useContext, useEffect, useRef, useState } from 'react';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { Button, Graphic, Loader, Title, Tooltip } from '@cognite/cogs.js';
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

import { ContainerTitle, StyledTitle } from './elements';
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

  const imageFileIds: string[] =
    boards
      ?.filter((board) => board.imageFileId)
      .map((board) => board.imageFileId) || [];

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
        {childSuites?.length ? (
          <>
            <ContainerTitle>
              <Title level={6}>Subsuites</Title>
            </ContainerTitle>
            {childSuites?.map((subSuiteKey) => (
              <SubSuiteTile
                suiteKey={subSuiteKey}
                key={subSuiteKey}
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
