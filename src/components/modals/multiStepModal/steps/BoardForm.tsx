import React from 'react';
import { A, Button, Input, Micro, Tooltip } from '@cognite/cogs.js';
import {
  FormContainer,
  BoardsContainer,
  AddedBoardItem,
  StyledCheckIcon,
  StyledTitle,
  StyledBody,
  Boards,
} from 'components/modals/elements';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { Flex } from 'styles/common';
import { Board, Suite } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';
import ActionButtons from './ActionButtons';
import BoardTypeSelector from './BoardTypeSelector';

interface Props {
  // TODO(dtc-215) use containers to avoid deep props nesting
  suite: Suite;
  board: Board;
  setSuite: TS_FIX_ME;
  setBoard: TS_FIX_ME;
}

export const BoardForm: React.FC<Props> = ({
  suite,
  board,
  setSuite,
  setBoard,
}: Props) => {
  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setBoard((prevState: Board) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const deleteBoard = (event: React.MouseEvent, boardKey: string) => {
    event.stopPropagation();
    const updatedBoardList = suite.boards.filter(
      (item) => item.key !== boardKey
    );
    setSuite((prevState: Suite) => ({
      ...prevState,
      boards: updatedBoardList,
    }));
    if (board.key) {
      setBoard(updatedBoardList[0] || {});
    }
  };
  return (
    <>
      <Flex>
        <FormContainer>
          <Input
            autoComplete="off"
            title="Title"
            name="title"
            value={board.title || ''}
            variant="noBorder"
            placeholder="Title"
            onChange={handleOnChange}
            fullWidth
          />
          <BoardTypeSelector board={board} setBoard={setBoard} />
          <Input
            autoComplete="off"
            title="URL"
            name="url"
            value={board.url || ''}
            variant="noBorder"
            placeholder="URL"
            onChange={handleOnChange}
            fullWidth
          />
          <Input
            autoComplete="off"
            title="Iframe snapshot"
            name="embedTag"
            value={board.embedTag || ''}
            variant="noBorder"
            placeholder="Tag"
            onChange={handleOnChange}
            fullWidth
          />
          <ActionButtons
            board={board}
            suite={suite}
            setBoard={setBoard}
            setSuite={setSuite}
          />
        </FormContainer>
        <BoardsContainer>
          <StyledTitle empty={isEmpty(suite?.boards)}>Added boards</StyledTitle>
          <Boards>
            {suite?.boards?.map((boardItem: Board) => {
              return (
                <AddedBoardItem
                  onClick={() => setBoard(boardItem)}
                  key={boardItem.key}
                  selected={isEqual(boardItem.key, board?.key)}
                >
                  <StyledCheckIcon type="Check" />
                  <Tooltip content={boardItem.title}>
                    <StyledBody level={4}>{boardItem.title}</StyledBody>
                  </Tooltip>
                  <Button
                    unstyled
                    onClick={(event) => deleteBoard(event, boardItem.key)}
                    icon="Trash"
                  />
                </AddedBoardItem>
              );
            })}
          </Boards>
          <Micro>
            To give access to the right groups, make sure groups are set-up
            correctly in Azure AD, see our{' '}
            <A href="#" isExternal>
              documentation
            </A>
          </Micro>
        </BoardsContainer>
      </Flex>
    </>
  );
};
