import React, { useContext, useEffect, useRef, useState } from 'react';
import { A, Button, Icon, Micro, Tooltip } from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { filesUploadState } from 'store/forms/selectors';
import { addFileToDeleteQueue } from 'store/forms/actions';
import { updateFileInfoState } from 'store/forms/thunks';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import { Flex } from 'styles/common';
import { Board, Suite } from 'store/suites/types';
import {
  boardValidator as boardValidationRules,
  validateValues,
  ValidationErrors as CustomValidationErrors,
} from 'validators';
import { RootDispatcher } from 'store/types';
import { CdfClientContext } from 'providers/CdfClientProvider';
import {
  deleteFileFromQueue,
  flushFilesQueue,
  replaceNewFileKey,
} from 'utils/files';
import { useMetrics } from 'utils/metrics';
import { addLayoutItemToDeleteQueue } from 'store/layout/actions';
import { Formik, FormikProps, FormikHelpers, Form, Field } from 'formik';
import {
  deleteBoardFromSuite,
  excludeFileFromBoard,
  key,
  updateSuite,
} from 'utils/forms';
import { CogniteExternalId } from '@cognite/sdk';
import * as actions from 'store/forms/actions';
import * as layoutActions from 'store/layout/actions';
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
  ActionButtonsContainer,
  FormFooter,
} from './elements';
import { InputField } from './controls/InputField';
import GroupsSelector from './controls/GroupsSelector';
import BoardTypeSelector from './controls/BoardTypeSelector';
import { FileUpload } from './controls/FileUpload';

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

type BoardFormProps = {
  filesUploadQueue: Map<string, File>;
  initialBoardItem?: Board;
  suite: Suite;
  handleCancel: () => void;
  handleSave: (suite: Suite) => void;
};

const initialFormValues: Board = {
  key: '',
  type: null,
  title: '',
  url: '',
  visibleTo: [],
  embedTag: '',
  imageFileId: '',
};

export const BoardForm: React.FC<BoardFormProps> = ({
  filesUploadQueue,
  initialBoardItem,
  suite,
  handleCancel,
  handleSave,
}) => {
  const dispatch = useDispatch<RootDispatcher>();
  const client = useContext(CdfClientContext);
  const metrics = useMetrics('EditSuite');
  const { deleteQueue } = useSelector(filesUploadState);

  const formikRef = useRef<FormikProps<Board>>(null);

  const [isNewItem, setIsNewItem] = useState<boolean>();
  const customErrors = useRef<CustomValidationErrors>({});
  const setCustomErrors = (val: CustomValidationErrors) => {
    customErrors.current = val;
  };

  const [suiteItem, setSuiteItem] = useState<Suite>(suite);

  useEffect(() => {
    setIsNewItem(!initialBoardItem);
    if (initialBoardItem) {
      formikRef.current?.setValues({ ...initialBoardItem });
    }
    dispatch(updateFileInfoState(client, initialBoardItem?.imageFileId));
    setSuiteItem(suite);
  }, []);

  const deleteBoardFromList = (
    event: React.MouseEvent,
    boardItem: Board,
    currentBoardKey: CogniteExternalId
  ) => {
    event.stopPropagation();
    metrics.track('DeleteBoard', {
      boardKey: boardItem.key,
      board: boardItem.title,
      suiteKey: suiteItem.key,
      suite: suiteItem.title,
      component: 'BoardForm',
    });
    if (boardItem?.imageFileId) {
      dispatch(addFileToDeleteQueue(boardItem.imageFileId));
    }
    if (boardItem.key === currentBoardKey) {
      formikRef.current?.resetForm();
    }
    dispatch(addLayoutItemToDeleteQueue(boardItem.key));
    setSuiteItem((prevState: Suite) =>
      deleteBoardFromSuite(prevState, boardItem.key)
    );
  };

  const openBoard = (boardItem: Board) => {
    flushFilesQueue(filesUploadQueue);
    metrics.track('Select_Board', {
      boardKey: boardItem.key,
      board: boardItem.title,
    });
    formikRef.current?.resetForm();
    dispatch(updateFileInfoState(client, boardItem.imageFileId));
    setIsNewItem(false);
    formikRef.current?.setValues({ ...boardItem });
  };

  const clear = (values: Board) => {
    // remove current file from upload queue
    if (values.key) {
      deleteFileFromQueue(filesUploadQueue, values.key);
    } else {
      flushFilesQueue(filesUploadQueue);
    }

    // remove current file from delete queue
    if (deleteQueue.includes(values.imageFileId)) {
      dispatch(actions.excludeFileFromDeleteQueue(values.imageFileId));
    }
    // reset file state
    dispatch(actions.clearFile());
    // reset layout delete queue
    dispatch(layoutActions.resetLayoutDeleteQueue());
    // reset custom errors
    setCustomErrors({});
    setIsNewItem(true);
    metrics.track('Cancel_BoardForm', { component: 'BoardForm' });
  };

  const handleFormSubmit = (
    boardValues: Board,
    { resetForm }: FormikHelpers<Board>
  ) => {
    let { key: boardKey } = boardValues;
    boardKey = boardKey || key();
    // handle fileUploadQueue
    if (isNewItem) {
      replaceNewFileKey(filesUploadQueue, boardKey); // if uploaded a file => give it a key
    } else if (deleteQueue.includes(boardValues.imageFileId)) {
      setSuiteItem((prevState: Suite) =>
        excludeFileFromBoard(prevState, boardKey)
      );
    }
    // imageFileId will be updated after a file is successfully uploaded
    setSuiteItem((prevState: Suite) =>
      updateSuite(prevState, { ...boardValues, key: boardKey })
    );
    resetForm();
    metrics.track(isNewItem ? 'AddNewBoard' : 'UpdateBoard', {
      boardKey,
      board: boardValues.title,
      useEmbedTag: !!boardValues.embedTag,
      useImagePreview:
        !!boardValues.imageFileId || filesUploadQueue.has(boardKey),
    });
  };

  return (
    <Formik
      initialValues={{
        ...initialFormValues,
      }}
      validate={(values) =>
        validateValues(values, boardValidationRules, customErrors.current)
      }
      onSubmit={handleFormSubmit}
      innerRef={formikRef}
    >
      {({ values, resetForm, isValid, dirty, isSubmitting, setSubmitting }) => (
        <>
          <Flex>
            <FormContainer>
              <Form>
                <CustomInputContainer>
                  <Field name="title" title="Title" component={InputField} />
                </CustomInputContainer>
                <CustomInputContainer>
                  <Field
                    name="type"
                    boardType={values.type}
                    component={BoardTypeSelector}
                  />
                </CustomInputContainer>

                <CustomInputContainer>
                  <Field
                    name="url"
                    title="Add link to board"
                    placeholder="URL"
                    component={InputField}
                  />
                </CustomInputContainer>
                <SnapshotInputContainer>
                  <CustomLabel>
                    <span>Add embedded tag for board</span>
                    <Tooltip content={<SnapshotTooltip />} interactive>
                      <Icon type="Help" />
                    </Tooltip>
                  </CustomLabel>
                  <Field name="embedTag" component={InputField} />
                </SnapshotInputContainer>
                <Field
                  name="imageFileId"
                  component={FileUpload}
                  filesUploadQueue={filesUploadQueue}
                  setCustomErrors={setCustomErrors}
                  boardKey={values.key}
                  boardTitle={values.title}
                />
                <Field
                  name="visibleTo"
                  component={GroupsSelector}
                  visibleTo={values.visibleTo}
                />
                <ActionButtonsContainer>
                  {!isNewItem && (
                    <Button
                      type="ghost"
                      htmlType="reset"
                      onClick={() => {
                        clear(values);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  )}

                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!isValid || !dirty}
                  >
                    {isNewItem ? 'Add board' : 'Update board'}
                  </Button>
                </ActionButtonsContainer>
              </Form>
            </FormContainer>

            <BoardsContainer>
              <div>
                <StyledTitle empty={isEmpty(suiteItem?.boards)}>
                  Added boards
                </StyledTitle>
                <Boards>
                  {suiteItem?.boards?.map((boardItem: Board) => (
                    <AddedBoardItem
                      onClick={() => openBoard(boardItem)}
                      key={boardItem.key}
                      selected={isEqual(boardItem.key, values.key)}
                    >
                      <StyledCheckIcon type="Check" />
                      <Tooltip content={boardItem.title}>
                        <StyledBody level={4}>{boardItem.title}</StyledBody>
                      </Tooltip>
                      <Button
                        unstyled
                        onClick={(event) =>
                          deleteBoardFromList(event, boardItem, values.key)
                        }
                        icon="Trash"
                      />
                    </AddedBoardItem>
                  ))}
                </Boards>
              </div>
              {!isEmpty(values.visibleTo) && (
                <Micro>
                  To give access to the right groups, make sure groups are
                  set-up correctly in Azure AD, see our{' '}
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

          <FormFooter>
            <Button
              type="ghost"
              htmlType="reset"
              onClick={() => {
                clear(values);
                resetForm();
                handleCancel();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {isSubmitting ? (
              <Icon type="Loading" />
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  setSubmitting(true);
                  handleSave(suiteItem);
                }}
              >
                Save
              </Button>
            )}
          </FormFooter>
        </>
      )}
    </Formik>
  );
};
