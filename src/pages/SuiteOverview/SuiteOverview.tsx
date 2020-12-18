import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Graphic, Loader, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import Suitebar from 'components/suitebar';
import { Tile } from 'components/tiles';
import { BoardMenu, SuiteMenu } from 'components/menus';
import { TilesContainer, OverviewContainer } from 'styles/common';
import { getBoardsBySuite, getSuitesTableState } from 'store/suites/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Board, Suite } from 'store/suites/types';
import { StyledTitle, NoBoardsContainer } from './elements';

const SuiteOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useDispatch<RootDispatcher>();

  const { loading: suitesLoading, loaded: suitesLoaded } = useSelector(
    getSuitesTableState
  );

  const suite: Suite = useSelector(getBoardsBySuite(id)) as Suite;

  if (!suitesLoaded) {
    return null;
  }

  if (suitesLoading) {
    return <Loader />;
  }

  if (!suite) {
    history.push('/');
  }

  const { title, color, boards } = suite || {};

  const handleOpenModal = (modalType: ModalType, modalProps: any) => {
    dispatch(modalOpen({ modalType, modalProps }));
  };

  const Header = () => {
    return (
      <>
        <SuiteAvatar color={color} title={title} />
        <Title as={StyledTitle} level={5}>
          {title}
        </Title>
        <SuiteMenu dataItem={suite} />
      </>
    );
  };
  return (
    <>
      <Suitebar
        leftCustomHeader={<Header />}
        actionButton={
          <Button
            variant="outline"
            type="secondary"
            icon="Plus"
            iconPlacement="left"
            onClick={() => handleOpenModal('AddBoard', { dataItem: suite })}
          >
            Add board
          </Button>
        }
      />
      <OverviewContainer>
        <TilesContainer>
          {!boards?.length ? (
            <NoBoardsContainer>
              <Graphic type="DataKits" />
              <Title level={5}>No dasboards added to suite yet</Title>
            </NoBoardsContainer>
          ) : (
            <>
              <Title level={6}>All boards</Title>
              {boards?.map((board: Board) => (
                <a
                  href={board.url}
                  key={board.key}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Tile
                    dataItem={board}
                    color={color}
                    view="board"
                    menu={<BoardMenu suite={suite} board={board} />}
                  />
                </a>
              ))}
            </>
          )}
        </TilesContainer>
      </OverviewContainer>
    </>
  );
};

export default SuiteOverview;
