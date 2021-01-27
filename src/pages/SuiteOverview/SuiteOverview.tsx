import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Graphic, Loader, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import Suitebar from 'components/suitebar';
import { Tile, InfographicsTile } from 'components/tiles';
import { BoardMenu, SuiteMenu } from 'components/menus';
import {
  TilesContainer,
  OverviewContainer,
  NoItemsContainer,
} from 'styles/common';
import { useDispatch, useSelector } from 'react-redux';
import { getBoardsBySuite, getSuitesTableState } from 'store/suites/selectors';
import { isAdmin } from 'store/groups/selectors';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Board, Suite } from 'store/suites/types';
import { UserSpaceState } from 'store/userSpace/types';
import { getUserSpace } from 'store/userSpace/selectors';
import isEqual from 'lodash/isEqual';
import { StyledTitle, LargeTilesContainer } from './elements';

const SuiteOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useDispatch<RootDispatcher>();
  const admin = useSelector(isAdmin);

  const { loading: suitesLoading, loaded: suitesLoaded } = useSelector(
    getSuitesTableState
  );
  const { loading: userSpaceLoading }: UserSpaceState = useSelector(
    getUserSpace
  );

  const suite: Suite = useSelector(getBoardsBySuite(id)) as Suite;

  if (!suitesLoaded) {
    return null;
  }

  if (suitesLoading || userSpaceLoading) {
    return <Loader />;
  }

  if (!suite) {
    history.push('/');
  }

  const { title, color, boards } = suite || {};

  const infographicsBoards = boards?.filter(
    (board) => board.type === 'infographics'
  );

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
        {admin && <SuiteMenu dataItem={suite} />}
      </>
    );
  };
  return (
    <>
      <Suitebar
        leftCustomHeader={<Header />}
        actionButton={
          admin && (
            <Button
              variant="outline"
              type="secondary"
              icon="Plus"
              iconPlacement="left"
              onClick={() => handleOpenModal('AddBoard', { dataItem: suite })}
            >
              Add board
            </Button>
          )
        }
      />
      <OverviewContainer>
        {!boards?.length ? (
          <NoItemsContainer>
            <Graphic type="DataKits" />
            <Title level={5}>No boards added to suite yet</Title>
          </NoItemsContainer>
        ) : (
          <>
            <LargeTilesContainer>
              {infographicsBoards?.map((board: Board) => (
                <a
                  key={board.key}
                  href={board.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InfographicsTile
                    dataItem={board}
                    color={color}
                    menu={<BoardMenu suite={suite} board={board} />}
                  />
                </a>
              ))}
            </LargeTilesContainer>
            <TilesContainer>
              <Title level={6}>All boards</Title>
              {boards?.map((board: Board) => {
                return (
                  <React.Fragment key={board.key}>
                    {!isEqual(board.type, 'infographics') && (
                      <a
                        href={board.url}
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
                    )}
                  </React.Fragment>
                );
              })}
            </TilesContainer>
          </>
        )}
      </OverviewContainer>
    </>
  );
};

export default SuiteOverview;
