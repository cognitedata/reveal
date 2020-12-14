import React from 'react';
import { A, Body, Button, Input, Select, Title, Micro } from '@cognite/cogs.js';
import {
  SelectLabel,
  SelectContainer,
  FormContainer,
  BoardsContainer,
  AddedBoardItem,
  StyledCheckIcon,
} from 'components/modals/elements';
import isEqual from 'lodash/isEqual';
import { Flex } from 'styles/common';
import { Board } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';

interface Props {
  actionButton: React.ReactElement;
  boards: Board[];
  boardValues: Board;
  setBoard: TS_FIX_ME;
  deleteBoard: (event: React.MouseEvent, key: string) => void;
}

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'application', label: 'Application' },
  { value: 'other', label: 'Other' },
];

export const BoardForm: React.FC<Props> = ({
  actionButton,
  boards,
  boardValues,
  setBoard,
  deleteBoard,
}: Props) => {
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

  const boardTypeValue = () =>
    options.find((option) => isEqual(option.value, boardValues.type)) || null;
  return (
    <>
      <Flex>
        <FormContainer>
          <Input
            autoComplete="off"
            title="Title"
            name="title"
            value={boardValues.title}
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
              value={boardTypeValue()}
              onChange={handleBoardTypeChange}
              options={options}
              closeMenuOnSelect
            />
          </SelectContainer>
          <Input
            autoComplete="off"
            title="URL"
            name="url"
            value={boardValues.url}
            variant="noBorder"
            placeholder="URL"
            onChange={handleOnChange}
            fullWidth
          />
          <Input
            autoComplete="off"
            title="Iframe snapshot"
            name="embedTag"
            value={boardValues.embedTag}
            variant="noBorder"
            placeholder="Tag"
            onChange={handleOnChange}
            fullWidth
          />
          {actionButton}
        </FormContainer>
        <BoardsContainer>
          <Title level={4}>Added boards</Title>
          {boards?.map((board: Board) => {
            return (
              <AddedBoardItem
                onClick={() => setBoard(board)}
                key={board.key}
                selected={boardValues?.key === board.key}
              >
                <StyledCheckIcon type="Check" />
                <Body level={4}>{board.title}</Body>
                <Button
                  unstyled
                  onClick={(event) => deleteBoard(event, board.key)}
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
