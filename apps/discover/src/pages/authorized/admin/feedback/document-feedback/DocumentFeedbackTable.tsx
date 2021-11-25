import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from 'react-table';

import compact from 'lodash/compact';
import sortBy from 'lodash/sortBy';

import { SetCommentTarget, CommentTarget } from '@cognite/react-comments';

import { shortDate } from '_helpers/date';
import { sortDates } from '_helpers/sortDates';
import { OKModal } from 'components/modal';
import { Table, Options, TableResults } from 'components/tablev3';
import { showErrorMessage } from 'components/toast';
import { COMMENT_NAMESPACE } from 'constants/comments';
import { EMPTY_FIELD_PLACEHOLDER } from 'constants/general';
import {
  useFeedbackUpdateMutate,
  updateFeedbackStatus,
  deleteObjectFeedback,
  recoverObjectFeedback,
} from 'modules/api/feedback';
import { useUserProfileQuery } from 'modules/api/user/useUserQuery';
import { ColumnMap } from 'modules/documentSearch/utils/columns';
import { FIELDS } from 'modules/feedback/constants';
import { feedbackHelper } from 'modules/feedback/helper';
import { DocumentFeedbackItem } from 'modules/feedback/types';
import { User } from 'modules/user/types';
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

interface Props {
  documentFeedbackItems: DocumentFeedbackItem[];
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}
export const DocumentFeedbackTable: React.FC<Props> = ({
  documentFeedbackItems,
  setCommentTarget,
  commentTarget,
}) => {
  const { objectFeedbackShowDeleted } = useFeedback();
  const [_feedback, setFeedback] = useState<DocumentFeedbackItem>();

  const { t } = useTranslation('Admin');

  const { data: user } = useUserProfileQuery();
  const { mutateAsync: addDocumentFeedback } =
    useFeedbackUpdateMutate('object');
  const { mutateAsync: updateDocumentFeedback } =
    useFeedbackUpdateMutate('object');

  const [highlightedIds, setHighlightedIds] = useState<TableResults>();
  const [expandedIds, setExpandedIds] = useState<TableResults>({});
  const [isDeleteWarningOpen, setDeleteWarningOpen] = useState(false);

  const isSensitiveByAdmin = (item: DocumentFeedbackItem) => {
    if (
      !Object.prototype.hasOwnProperty.call(item, 'isSensitiveByAdmin') ||
      item.isSensitiveByAdmin === null
    ) {
      return null;
    }
    return item.isSensitiveByAdmin;
  };

  const feedbackColumns: ColumnMap<DocumentFeedbackItem> = {
    markedAs: {
      Header: FIELDS.markedAs.display,
      accessor: 'markedAs',
      width: '300px',
      maxWidth: '0.5fr',
      order: 0,
      Cell: (cell) => <DocumentFeedbackLabels feedback={cell.row.original} />,
      // sortType: (row1, row2) => row1.original.markedAs
      disableSorting: true,
    },
    createdOn: {
      Header: FIELDS.date.display,
      accessor: 'createdTime',
      width: '140px',
      order: 1,
      Cell: (cell) => <span>{shortDate(cell.row.original.createdTime)}</span>,
      sortType: (row1, row2) =>
        sortDates(
          new Date(row1.original.createdTime),
          new Date(row2.original.createdTime)
        ),
    },
    status: {
      Header: FIELDS.status.display,
      accessor: 'statusCol', // don't rename this to status. it cause to render a <div> inside <p> validation error
      width: '140px',
      order: 2,
      Cell: (cell) => (
        <StatusColumn
          status={cell.row.original.status}
          handleChangeFeedbackStatus={(status: number) =>
            cell.row.original.id &&
            handleUpdateFeedbackStatus(cell.row.original.id, status)
          }
        />
      ),
      sortType: (row1, row2) =>
        (row1.original.status || 0) - (row2.original.status || 0),
    },
    comment: {
      Header: 'User comment',
      accessor: 'comment',
      width: '300px',
      maxWidth: '0.5fr',
      order: 3,
      Cell: (cell) => (
        <span>
          {cell.row.original.comment.length ? (
            feedbackHelper.shortCommentText(cell.row.original.comment, 65, 75)
          ) : (
            <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
          )}
        </span>
      ),
      sortType: (row1, row2) => {
        if (row1.original.comment.length && row2.original.comment.length) {
          return row1.original.comment.localeCompare(row2.original.comment);
        }

        if (row1.original.comment.length && !row2.original.comment.length) {
          return -1;
        }

        if (row2.original.comment.length && !row1.original.comment.length) {
          return 1;
        }

        return 0;
      },
    },
    user: {
      Header: FIELDS.user.display,
      accessor: 'user',
      width: '200px',
      order: 4,
      Cell: (cell) => (
        <span>
          {cell.row.original.user ? (
            getFullNameOrDefaultText(cell.row.original.user)
          ) : (
            <EmptyCell>{EMPTY_FIELD_PLACEHOLDER}</EmptyCell>
          )}
        </span>
      ),
      sortType: (row1, row2) =>
        getFullNameOrDefaultText(row1.original.user).localeCompare(
          getFullNameOrDefaultText(row2.original.user)
        ),
    },
    assignedTo: {
      Header: FIELDS.assignedTo.display,
      accessor: 'assignedToCol', // Don't rename this to assignedTo. It cause to render a "<div> inside <p> validation error".
      width: '200px',
      order: 5,
      Cell: ({ row }) => (
        <AssigneeColumn
          assignee={row.original.assignee}
          assignFeedback={() => updateFeedbackAssignee(row.original.id, user)}
          unassignFeedback={() => updateFeedbackAssignee(row.original.id)}
        />
      ),
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

  const updateFeedbackAssignee = (id: string, user?: User) => {
    updateDocumentFeedback({
      id,
      payload: { assignedTo: user?.id || '' },
    });
  };

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

  const handleUpdateFeedbackStatus = (feedbackId: string, status: number) =>
    updateFeedbackStatus(feedbackId, status, addDocumentFeedback).catch(
      (error) => {
        showErrorMessage(error.message);
      }
    );

  const recoverFeedback = (feedback: DocumentFeedbackItem) => {
    recoverObjectFeedback(feedback.id, updateDocumentFeedback);
  };

  const handleDeleteGeneralFeedback = (feedback: DocumentFeedbackItem) => {
    if (feedback.isSensitiveData) {
      if (isSensitiveByAdmin(feedback) === null) {
        setDeleteWarningOpen(true);
        return;
      }
    }
    deleteObjectFeedback(feedback.id, updateDocumentFeedback);
  };

  const handleRowClick = useCallback((row: Row & { isSelected: boolean }) => {
    const feedback = row.original as DocumentFeedbackItem;
    setExpandedIds((state) => ({
      ...state,
      [feedback.id]: !state[feedback.id],
    }));
  }, []);

  const renderRowSubComponent = useCallback(
    ({ row }) => {
      if (!objectFeedbackShowDeleted) {
        return (
          <DocumentFeedbackDetails
            feedback={row.original as DocumentFeedbackItem}
          />
        );
      }
      return (
        <DeletedDocumentFeedbackDetails
          feedback={row.original as DocumentFeedbackItem}
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

      <Table<DocumentFeedbackItem>
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
