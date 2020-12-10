import React from 'react';
import { A, Icon, Body, Input, Select, Title, Micro } from '@cognite/cogs.js';
import {
  SelectLabel,
  SelectContainer,
  FormContainer,
  BoardsContainer,
  AddedBoardItem,
  StyledCheckIcon,
} from 'components/modals/elements';
import { Flex } from 'styles/common';
import { Board } from 'store/suites/types';

interface Props {
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // handleBoardTypeChange: any;
  actionButton: React.ReactElement;
  boards: any;
  boardValues: any;
  // boardType: any;
  setNewBoard: any;
}

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'other', label: 'Other' },
];

export const BoardStep: React.FC<Props> = ({
  handleOnChange,
  // handleBoardTypeChange,
  actionButton,
  boards,
  boardValues,
  // boardType,
  setNewBoard,
}: Props) => {
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
          {/* <SelectContainer>
            <SelectLabel>Select type</SelectLabel>
            <Select
              theme="grey"
              placeholder="Select type"
              name="type"
              value={options.find((o) => o.value === boardType)}
              onChange={handleBoardTypeChange}
              options={options}
            />
          </SelectContainer> */}
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
                onClick={() => {
                  setNewBoard(board);
                }}
                key={board.key}
                selected={boardValues?.key === board.key}
              >
                <StyledCheckIcon type="Check" />
                <Body level={4}>{board.title}</Body>
                <Icon type="Trash" />
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
