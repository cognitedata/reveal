import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cell } from 'react-table';

import compact from 'lodash/compact';
import sortBy from 'lodash/sortBy';
import {
  useFeedbackUpdateMutate,
  updateFeedbackStatus,
  deleteObjectFeedback,
  recoverObjectFeedback,
} from 'services/feedback';
import { useUserProfileQuery } from 'services/user/useUserQuery';
import { getDateOrDefaultText } from 'utils/date';
import { sortByDate } from 'utils/sort/sortByDate';

import { ObjectFeedbackResponse, User } from '@cognite/discover-api-types';
import { SetCommentTarget, CommentTarget } from '@cognite/react-comments';

import { OKModal } from 'components/modal';
import { Table, Options, TableResults, RowProps } from 'components/tablev3';
import { showErrorMessage } from 'components/toast';
import { COMMENT_NAMESPACE } from 'constants/comments';
import { EMPTY_FIELD_PLACEHOLDER } from 'constants/general';
import { ColumnMap } from 'modules/documentSearch/utils/columns';
import { FIELDS } from 'modules/feedback/constants';
import { feedbackHelper } from 'modules/feedback/helper';
import { getFullNameOrDefaultText } from 'modules/user/utils';

import { ActionColumn } from '../common/columns/ActionColumn';
import { AssigneeColumn } from '../common/columns/AssigneeColumn';
import { StatusColumn } from '../common/columns/StatusColumn';
import { EmptyCell } from '../elements';
import { useFeedback } from '../Selector';

import {
  DeletedDocumentFeedbackDetails,
  DocumentFeedbackDetails,
} from './DocumentFeedbackDetails';
import { DocumentFeedbackLabels } from './DocumentFeedbackLabels';

type UpdateFeedbackAssignee = (
  feedback: ObjectFeedbackResponse,
  user?: User
) => void;
type HandleUpdateFeedbackStatus = (
  feedback: ObjectFeedbackResponse,
  status: number
) => void;

const getRowStatusColumn =
  (handleUpdateFeedbackStatus: HandleUpdateFeedbackStatus) =>
  (cell: Cell<ObjectFeedbackResponse>) =>
    (
      <StatusColumn
        status={cell.row.original.status}
        handleChangeFeedbackStatus={(status: number) =>
          cell.row.original &&
          handleUpdateFeedbackStatus(cell.row.original, status)
        }
      />
    );

const getRowAssigneeColumn =
  (updateFeedbackAssignee: UpdateFeedbackAssignee, user?: User) =>
  (cell: Cell<ObjectFeedbackResponse>) =>
    (
      <AssigneeColumn
        assignee={cell.row.original.assignee}
        assignFeedback={() => updateFeedbackAssignee(cell.row.original, user)}
        unassignFeedback={() => updateFeedbackAssignee(cell.row.original)}
      />
    );

interface Props {
  documentFeedbackItems: ObjectFeedbackResponse[];
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}
export const DocumentFeedbackTable: React.FC<Props> = ({
  documentFeedbackItems,
  setCommentTarget,
  commentTarget,
}) => {
  const { objectFeedbackShowDeleted } = useFeedback();
  const [_feedback, setFeedback] = useState<ObjectFeedbackResponse>();

  const { t } = useTranslation('Admin');

  const { data: user } = useUserProfileQuery();
  const { mutateAsync: addDocumentFeedback } =
    useFeedbackUpdateMutate('object');
  const { mutateAsync: updateDocumentFeedback } =
    useFeedbackUpdateMutate('object');

  const [highlightedIds, setHighlightedIds] = useState<TableResults>();
  const [expandedIds, setExpandedIds] = useState<TableResults>({});
  const [isDeleteWarningOpen, setDeleteWarningOpen] = useState(false);

  const isSensitiveByAdmin = (item: ObjectFeedbackResponse) => {
    if (
      !Object.prototype.hasOwnProperty.call(item, 'isSensitiveByAdmin') ||
      item.isSensitiveByAdmin === null
    ) {
      return null;
    }
    return item.isSensitiveByAdmin;
  };

  const handleUpdateFeedbackStatus: HandleUpdateFeedbackStatus = (
    feedback,
    status
  ) =>
    updateFeedbackStatus(feedback.id, status, addDocumentFeedback).catch(
      (error) => {
        showErrorMessage(error.message);
      }
    );

  const updateFeedbackAssignee: UpdateFeedbackAssignee = (feedback, user) => {
    updateDocumentFeedback({
      id: feedback.id,
      payload: { assignedTo: user?.id || '' },
    });
  };

  /**
   * Reason for eslint-disable: components that are inline-rendered for React-Table cell,
   * makes sense to be "inlined", as it is easier to read and closer to the column cell settings.
   */
  const feedbackColumns: ColumnMap<ObjectFeedbackResponse> = {
    markedAs: {
      Header: FIELDS.markedAs.display,
      accessor: 'markedAs',
      width: '300px',
      maxWidth: '0.5fr',
      order: 0,
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: (cell) => <DocumentFeedbackLabels feedback={cell.row.original} />,
      // sortType: (row1, row2) => row1.original.markedAs
      disableSorting: true,
    },
    createdOn: {
      Header: FIELDS.date.display,
      accessor: (row) => getDateOrDefaultText(row.createdTime),
      width: '140px',
      order: 1,
      sortType: (row1, row2) =>
        sortByDate(
          new Date(row1.original.createdTime),
          new Date(row2.original.createdTime)
        ),
    },
    status: {
      Header: FIELDS.status.display,
      accessor: 'statusCol', // don't rename this to status. it cause to render a <div> inside <p> validation error
      width: '140px',
      order: 2,
      Cell: getRowStatusColumn(handleUpdateFeedbackStatus),
      sortType: (row1, row2) =>
        (row1.original.status || 0) - (row2.original.status || 0),
    },
    comment: {
      Header: 'User comment',
      accessor: 'comment',
      width: '300px',
      maxWidth: '0.5fr',
      order: 3,
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: (cell) => (
        <span>
          {cell.row.original.comment?.length ? (
            feedbackHelper.shortCommentText(cell.row.original.comment, 65, 75)
          ) : (
            <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
          )}
        </span>
      ),
      sortType: (row1, row2) => {
        if (row1.original.comment?.length && row2.original.comment?.length) {
          return row1.original.comment.localeCompare(row2.original.comment);
        }

        if (row1.original.comment?.length && !row2.original.comment?.length) {
          return -1;
        }

        if (row2.original.comment?.length && !row1.original.comment?.length) {
          return 1;
        }

        return 0;
      },
    },
    user: {
      Header: FIELDS.user.display,
      accessor: 'userCol',
      width: '200px',
      order: 4,
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: (cell) => {
        return (
          <span>
            {cell.row.original.user ? (
              getFullNameOrDefaultText(cell.row.original.user)
            ) : (
              <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
            )}
          </span>
        );
      },
      sortType: (row1, row2) => {
        return getFullNameOrDefaultText(row1.original.user).localeCompare(
          getFullNameOrDefaultText(row2.original.user)
        );
      },
    },
    assignedTo: {
      Header: FIELDS.assignedTo.display,
      accessor: 'assignedToCol', // Don't rename this to assignedTo. It cause to render a "<div> inside <p> validation error".
      width: '200px',
      order: 5,
      Cell: getRowAssigneeColumn(updateFeedbackAssignee, user),
      sortType: (row1, row2) =>
        getFullNameOrDefaultText(row1.original.assignee).localeCompare(
          getFullNameOrDefaultText(row2.original.assignee)
        ),
    },
    actions: {
      Header: ' ',
      accessor: 'actions',
      width: '150px',
      order: 6,
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: (cell) => (
        <ActionColumn
          feedbackRow={cell.row.original}
          showDeleted={objectFeedbackShowDeleted}
          setSelectedFeedback={setFeedback}
          setCommentOpen={() => {
            setHighlightedIds({ [cell.row.original.id]: true });
            setCommentTarget({
              id: cell.row.original.id,
              targetType: COMMENT_NAMESPACE.feedbackDocument,
            });
          }}
          recoverFeedback={recoverFeedback}
          deleteGeneralFeedback={handleDeleteGeneralFeedback}
        />
      ),
      disableSorting: true,
    },
  };

  const selectedColumns: string[] = [
    'markedAs',
    'createdOn',
    'status',
    'comment',
    'user',
    'assignedTo',
    'actions',
  ];

  React.useEffect(() => {
    setHighlightedIds(commentTarget ? { [commentTarget.id]: true } : {});
  }, [commentTarget]);

  const columns = React.useMemo(
    () =>
      sortBy(
        compact(selectedColumns.map((column) => feedbackColumns[column])),
        'order'
      ),
    [selectedColumns]
  );

  const [options] = useState<Options>({
    checkable: false,
    expandable: true,
    flex: false,
    hideScrollbars: true,
    pagination: {
      enabled: true,
      pageSize: 50,
    },
  });

  const recoverFeedback = (feedback: ObjectFeedbackResponse) => {
    recoverObjectFeedback(feedback.id, updateDocumentFeedback);
  };

  const handleDeleteGeneralFeedback = (feedback: ObjectFeedbackResponse) => {
    if (feedback.isSensitiveData) {
      if (isSensitiveByAdmin(feedback) === null) {
        setDeleteWarningOpen(true);
        return;
      }
    }
    deleteObjectFeedback(feedback.id, updateDocumentFeedback);
  };

  const handleRowClick = useCallback(
    (row: RowProps & { isSelected: boolean }) => {
      const feedback = row.original as ObjectFeedbackResponse;
      setExpandedIds((state) => ({
        ...state,
        [feedback.id]: !state[feedback.id],
      }));
    },
    []
  );

  const renderRowSubComponent = useCallback(
    ({ row }) => {
      if (!objectFeedbackShowDeleted) {
        return (
          <DocumentFeedbackDetails
            feedback={row.original as ObjectFeedbackResponse}
          />
        );
      }
      return (
        <DeletedDocumentFeedbackDetails
          feedback={row.original as ObjectFeedbackResponse}
        />
      );
    },
    [objectFeedbackShowDeleted]
  );

  const toggleDocumentFeedbackData = React.useMemo(() => {
    if (!documentFeedbackItems) return [];
    return documentFeedbackItems.filter(
      (item) => item.deleted === objectFeedbackShowDeleted
    );
  }, [documentFeedbackItems, objectFeedbackShowDeleted]);

  return (
    <>
      <OKModal
        visible={isDeleteWarningOpen}
        onCancel={() => setDeleteWarningOpen(false)}
        onOk={() => setDeleteWarningOpen(false)}
        title={t('Assess sensitivity')}
      >
        {t(
          'Assess the sensitivity of the document before archiving this feedback.'
        )}
      </OKModal>

      <Table<ObjectFeedbackResponse>
        id="feedback-result-table"
        data={toggleDocumentFeedbackData}
        columns={columns}
        handleRowClick={handleRowClick}
        renderRowSubComponent={renderRowSubComponent}
        options={options}
        expandedIds={expandedIds}
        highlightedIds={highlightedIds}
      />
    </>
  );
};
