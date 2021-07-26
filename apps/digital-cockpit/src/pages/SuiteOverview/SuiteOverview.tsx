import React, { useContext, useEffect, useRef, useState } from 'react';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { Button, Graphic, Loader, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import Suitebar from 'components/suitebar';
import { SuiteMenu } from 'components/menus';
import { OverviewContainer, NoItemsContainer } from 'styles/common';
import { useDispatch, useSelector } from 'react-redux';
import { getBoardsBySuite, getSuitesTableState } from 'store/suites/selectors';
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
import { StyledTitle } from './elements';

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

  const suite: Suite = useSelector(getBoardsBySuite(id)) as Suite;

  const metrics = useMetrics('SuiteOverview');

  const { title, color, boards = [] } = suite || {};
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
    modalProps: { dataItem: Suite }
  ) => {
    const { dataItem: suiteItem } = modalProps;
    metrics.track(`Select_${modalType}`, {
      suiteKey: suiteItem.key,
      suite: suiteItem.title,
    });
    dispatch(modalOpen({ modalType, modalProps }));
  };

  const Header = () => (
    <>
      <SuiteAvatar color={color} title={title} />
      <Title as={StyledTitle} level={5}>
        {title}
      </Title>
      {canEdit && <SuiteMenu dataItem={suite} />}
    </>
  );

  const renderActionButtons = () => {
    const actionButtons = [];
    if (canEdit) {
      actionButtons.push(
        <Button
          key="add-board"
          type="ghost"
          icon="PlusCompact"
          iconPlacement="left"
          onClick={() => handleOpenModal('AddBoard', { dataItem: suite })}
        >
          Add board
        </Button>
      );
    }
    if (canEdit) {
      if (editingLayout) {
        actionButtons.push(
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
            Save layout
          </Button>
        );
      } else {
        actionButtons.push(
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
            Edit layout
          </Button>
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
        {!boards?.length ? (
          <NoItemsContainer>
            <Graphic type="DataKits" />
            <Title level={5}>No boards added to suite yet</Title>
          </NoItemsContainer>
        ) : (
          <SuiteOverviewGrid
            boards={boards}
            suite={suite}
            layout={layout}
            editingLayout={editingLayout}
            ref={gridComponentRef}
          />
        )}
      </OverviewContainer>
    </>
  );
};

export default React.memo(SuiteOverview);
