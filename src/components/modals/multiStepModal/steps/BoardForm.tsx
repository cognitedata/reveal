import React from 'react';
import { A, Button, Icon, Input, Micro, Tooltip } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { suiteState, boardState } from 'store/forms/selectors';
import { setBoard, deleteBoard } from 'store/forms/actions';
import {
  FormContainer,
  BoardsContainer,
  AddedBoardItem,
  StyledCheckIcon,
  StyledTitle,
  StyledBody,
  Boards,
  CustomLabel,
  CustomInputContainer,
  SnapshotInputContainer,
  CustomTooltipContainer,
  StyledLink,
} from 'components/modals/elements';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { Flex } from 'styles/common';
import { Board, Suite } from 'store/suites/types';
import { useForm } from 'hooks/useForm';
import { boardValidator } from 'validators';
import { RootDispatcher } from 'store/types';
import ActionButtons from './ActionButtons';
import BoardTypeSelector from './BoardTypeSelector';
import GroupsSelector from './GroupsSelector';

const SnapshotTooltip = () => {
  return (
    <CustomTooltipContainer>
      A snapshot is a preview of your data, you can learn more about snapshots{' '}
      {/* TODO(dtc-224) provide with correct link */}
      <A href="#" isExternal>
        here
      </A>
    </CustomTooltipContainer>
  );
};

export const BoardForm: React.FC = () => {
  const { errors, setErrors, validateField } = useForm(boardValidator);
  const suite = useSelector(suiteState);
  const board = useSelector(boardState) as Board;
  const dispatch = useDispatch<RootDispatcher>();

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    dispatch(
      setBoard({
        ...board,
        [name]: value,
      })
    );

    setErrors((prevState: Suite) => ({
      ...prevState,
      [name]: validateField(name, value),
    }));
  };

  const deleteBoardFromList = (event: React.MouseEvent, boardKey: string) => {
    event.stopPropagation();
    dispatch(deleteBoard(boardKey));
  };

  const openBoard = (boardItem: Board) => {
    dispatch(setBoard(boardItem));
  };

  return (
    <>
      <Flex>
        <FormContainer>
          <CustomInputContainer>
            <Input
              autoComplete="off"
              title="Title"
              name="title"
              error={errors?.title}
              value={board.title || ''}
              variant="noBorder"
              placeholder="Title"
              onChange={handleOnChange}
              fullWidth
            />
          </CustomInputContainer>
          <BoardTypeSelector />
          <CustomInputContainer>
            <Input
              autoComplete="off"
              title="URL"
              name="url"
              error={errors?.url}
              value={board.url || ''}
              variant="noBorder"
              placeholder="URL"
              onChange={handleOnChange}
              fullWidth
            />
          </CustomInputContainer>
          <SnapshotInputContainer>
            <CustomLabel>
              <span>Add snapshot for dashboard</span>
              <Tooltip content={<SnapshotTooltip />} interactive>
                <Icon type="Help" />
              </Tooltip>
            </CustomLabel>
            <Input
              autoComplete="off"
              name="embedTag"
              value={board.embedTag || ''}
              variant="noBorder"
              placeholder="Tag"
              onChange={handleOnChange}
              fullWidth
            />
          </SnapshotInputContainer>
          <GroupsSelector />
          <ActionButtons />
        </FormContainer>
        <BoardsContainer>
          <div>
            <StyledTitle empty={isEmpty(suite?.boards)}>
              Added boards
            </StyledTitle>
            <Boards>
              {suite?.boards?.map((boardItem: Board) => {
                return (
                  <AddedBoardItem
                    onClick={() => openBoard(boardItem)}
                    key={boardItem.key}
                    selected={isEqual(boardItem.key, board?.key)}
                  >
                    <StyledCheckIcon type="Check" />
                    <Tooltip content={boardItem.title}>
                      <StyledBody level={4}>{boardItem.title}</StyledBody>
                    </Tooltip>
                    <Button
                      unstyled
                      onClick={(event) =>
                        deleteBoardFromList(event, boardItem.key)
                      }
                      icon="Trash"
                    />
                  </AddedBoardItem>
                );
              })}
            </Boards>
          </div>
          {!isEmpty(board.visibleTo) && (
            <Micro>
              To give access to the right groups, make sure groups are set-up
              correctly in Azure AD, see our{' '}
              {/* TODO(dtc-224) provide with correct link */}
              <StyledLink href="#" isExternal>
                documentation
              </StyledLink>
            </Micro>
          )}
        </BoardsContainer>
      </Flex>
    </>
  );
};
