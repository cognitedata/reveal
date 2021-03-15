import React, { useContext, useEffect, useState } from 'react';
import { A, Button, Icon, Input, Micro, Tooltip } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { suiteState, boardState } from 'store/forms/selectors';
import { deleteBoard, addFileToDeleteQueue } from 'store/forms/actions';
import { setBoardState } from 'store/forms/thunks';
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
import { Board } from 'store/suites/types';
import { useForm } from 'hooks/useForm';
import { boardValidator } from 'validators';
import { RootDispatcher } from 'store/types';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { flushFilesQueue } from 'utils/files';
import { useMetrics } from 'utils/metrics';
import { FileUpload } from './FileUpload';
import ActionButtons from './ActionButtons';
import BoardTypeSelector from './BoardTypeSelector';
import GroupsSelector from './GroupsSelector';

const SnapshotTooltip = () => (
  <CustomTooltipContainer>
    Find more information about how to embed a dashboard, e.g., Grafana,
    PowerBI,&nbsp;
    {/* TODO(DTC-348) replace with stable link as soon as it is available */}
    <A
      href="https://pr-567.docs.preview.cogniteapp.com/cockpit/guides/admins.html#example-use-links-from-a-grafana-report-to-show-live-data-in-the-digital-cockpit-board"
      isExternal
      target="_blank"
    >
      here
    </A>
  </CustomTooltipContainer>
);

type Props = {
  filesUploadQueue: Map<string, File>;
};

type BoardTouchedFields = {
  [Property in keyof Board]?: boolean;
};

export const BoardForm: React.FC<Props> = ({ filesUploadQueue }) => {
  const {
    errors,
    setErrors,
    validateField,
    validateBoard,
    clearErrors,
    touched,
  } = useForm(boardValidator);
  const suite = useSelector(suiteState);
  const board = useSelector(boardState) as Board;
  const dispatch = useDispatch<RootDispatcher>();
  const client = useContext(CdfClientContext);
  const metrics = useMetrics('EditSuite');
  const [
    initialValidationDispatched,
    setInitialValidationDispatched,
  ] = useState(false);

  useEffect(() => {
    if (!initialValidationDispatched) {
      setInitialValidationDispatched(true);
      validateBoard(board);
    }
  }, [board, initialValidationDispatched, validateBoard]);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    dispatch(
      setBoardState(client, {
        ...board,
        [name]: value,
      })
    );
    validateField(name, value);
  };
  const handleOnBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    validateField(name, value);
  };

  const deleteBoardFromList = (event: React.MouseEvent, boardItem: Board) => {
    event.stopPropagation();
    metrics.track('DeleteBoard', {
      boardKey: boardItem.key,
      board: boardItem.title,
      suiteKey: suite.key,
      suite: suite.title,
      component: 'BoardForm',
    });
    if (boardItem?.imageFileId) {
      dispatch(addFileToDeleteQueue(boardItem.imageFileId));
    }
    if (boardItem.key === board.key) {
      clearErrors();
    }
    dispatch(deleteBoard(boardItem.key));
  };

  const openBoard = (boardItem: Board) => {
    flushFilesQueue(filesUploadQueue);
    metrics.track('Select_Board', {
      boardKey: boardItem.key,
      board: boardItem.title,
    });
    clearErrors();
    dispatch(setBoardState(client, boardItem));
  };

  const clear = () => {
    clearErrors();
    setInitialValidationDispatched(false);
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
              error={touched.title && errors?.title}
              value={board.title || ''}
              variant="noBorder"
              placeholder="Title"
              onChange={handleOnChange}
              onBlur={handleOnBlur}
              fullWidth
            />
          </CustomInputContainer>
          <BoardTypeSelector
            error={errors?.type}
            touched={!!touched.type}
            validate={validateField}
          />
          <CustomInputContainer>
            <Input
              autoComplete="off"
              title="Add link to board"
              name="url"
              error={touched.url && errors?.url}
              value={board.url || ''}
              variant="noBorder"
              placeholder="URL"
              onChange={handleOnChange}
              onBlur={handleOnBlur}
              fullWidth
            />
          </CustomInputContainer>
          <SnapshotInputContainer>
            <CustomLabel>
              <span>Add embedded tag for board</span>
              <Tooltip content={<SnapshotTooltip />} interactive>
                <Icon type="Help" />
              </Tooltip>
            </CustomLabel>
            <Input
              autoComplete="off"
              name="embedTag"
              error={errors?.embedTag}
              value={board.embedTag || ''}
              variant="noBorder"
              placeholder="Tag"
              onChange={handleOnChange}
              onBlur={handleOnBlur}
              fullWidth
            />
          </SnapshotInputContainer>
          <FileUpload
            filesUploadQueue={filesUploadQueue}
            error={errors?.imageFileId}
            setErrors={setErrors}
          />
          <GroupsSelector />
          <ActionButtons filesUploadQueue={filesUploadQueue} onCancel={clear} />
        </FormContainer>
        <BoardsContainer>
          <div>
            <StyledTitle empty={isEmpty(suite?.boards)}>
              Added boards
            </StyledTitle>
            <Boards>
              {suite?.boards?.map((boardItem: Board) => (
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
                    onClick={(event) => deleteBoardFromList(event, boardItem)}
                    icon="Trash"
                  />
                </AddedBoardItem>
              ))}
            </Boards>
          </div>
          {!isEmpty(board.visibleTo) && (
            <Micro>
              To give access to the right groups, make sure groups are set-up
              correctly in Azure AD, see our{' '}
              {/* TODO(DTC-348) replace with stable link as soon as it is available */}
              <StyledLink
                href="https://pr-567.docs.preview.cogniteapp.com/cockpit/guides/admins.html#manage-access-to-a-board"
                isExternal
                target="_blank"
              >
                documentation
              </StyledLink>
            </Micro>
          )}
        </BoardsContainer>
      </Flex>
    </>
  );
};
