import React from 'react';
import { A, Body, Button, Input, Select, Micro } from '@cognite/cogs.js';
import {
  SelectLabel,
  SelectContainer,
  FormContainer,
  BoardsContainer,
  AddedBoardItem,
  StyledCheckIcon,
  StyledTitle,
  ActionButtons,
} from 'components/modals/elements';
import { key } from '_helpers/generateKey';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { Flex } from 'styles/common';
import { Board, Suite } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';

interface Props {
  suite: Suite;
  board: Board;
  setSuite: TS_FIX_ME;
  setBoard: TS_FIX_ME;
}

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'application', label: 'Application' },
  { value: 'other', label: 'Other' },
];

export const BoardForm: React.FC<Props> = ({
  suite,
  board,
  setSuite,
  setBoard,
}: Props) => {
  const isBoardsEmpty = isEmpty(suite?.boards);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setBoard((prevState: Board) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBoardTypeChange = (selectedOption: TS_FIX_ME) => {
    setBoard((prevState: Board) => ({
      ...prevState,
      type: selectedOption.value,
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

  const addNewBoard = () => {
    setSuite((prevState: Suite) => ({
      ...prevState,
      boards: suite.boards.concat({ ...board, key: key() }),
    }));
    setBoard({});
  };

  const updateBoard = () => {
    const boardIndex = suite.boards.findIndex((element: Board) =>
      isEqual(element.key, board.key)
    );
    const boardsCopy = cloneDeep(suite.boards);
    boardsCopy[boardIndex] = merge(boardsCopy[boardIndex], board);
    setSuite((prevState: Suite) => {
      return omit(
        {
          ...prevState,
          boards: boardsCopy,
        },
        'lastUpdatedTime'
      );
    });
  };

  const clearForm = () => {
    setBoard({});
  };

  const boardTypeValue = () =>
    options.find((option) => isEqual(option.value, board.type)) || null;
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
          <SelectContainer>
            <SelectLabel>Select type</SelectLabel>
            <Select
              theme="grey"
              placeholder="Select type"
              name="type"
              value={boardTypeValue() || null}
              onChange={handleBoardTypeChange}
              options={options}
              closeMenuOnSelect
            />
          </SelectContainer>
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
          <ActionButtons>
            {board.key && !isBoardsEmpty ? (
              <>
                <Button variant="ghost" onClick={clearForm}>
                  Cancel
                </Button>
                <Button type="primary" onClick={updateBoard}>
                  Update board
                </Button>
              </>
            ) : (
              <Button type="primary" onClick={addNewBoard}>
                Add board
              </Button>
            )}
          </ActionButtons>
        </FormContainer>
        <BoardsContainer>
          <StyledTitle empty={isBoardsEmpty}>Added boards</StyledTitle>
          {suite?.boards?.map((boardItem: Board) => {
            return (
              <AddedBoardItem
                onClick={() => setBoard(boardItem)}
                key={boardItem.key}
                selected={isEqual(boardItem.key, board?.key)}
              >
                <StyledCheckIcon type="Check" />
                <Body level={4}>{boardItem.title}</Body>
                <Button
                  unstyled
                  onClick={(event) => deleteBoard(event, boardItem.key)}
                  icon="Trash"
                />
              </AddedBoardItem>
            );
          })}
          <Micro>
            Giving the user information something like Make sure groups are
            set-up in Azure AD, see our{' '}
            <A href="#" isExternal>
              documentation
            </A>
          </Micro>
        </BoardsContainer>
      </Flex>
    </>
  );
};
