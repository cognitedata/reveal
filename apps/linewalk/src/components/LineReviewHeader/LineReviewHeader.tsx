import { useState } from 'react';
import dayjs from 'dayjs';
import { Button, Modal, Input } from '@cognite/cogs.js';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import { useHistory } from 'react-router';
import { PagePath } from 'pages/Menubar';
import StatusTag from 'components/StatusTag';
import useLineReviews from 'modules/lineReviews/hooks';

import { LineReviewHeaderWrapper } from './elements';

export type LineReviewHeaderProps = {
  lineReview: LineReview;
};

const LineReviewHeader = ({ lineReview }: LineReviewHeaderProps) => {
  const history = useHistory();
  const { updateLineReview } = useLineReviews();
  const [isReportModalOpen, setReportModalStatus] = useState(false);
  const [additionalInformation, setAdditionalInformation] = useState(
    lineReview.comments?.[0] || { text: '', user: { name: '' } }
  );

  const onMarkStatus = (status: LineReviewStatus) => {
    const nextLineReview: LineReview = {
      ...lineReview,
      status,
      comments: [additionalInformation],
    };
    updateLineReview(nextLineReview);
    setReportModalStatus(false);
  };

  const renderReportButton = () => {
    if (lineReview.status === 'OPEN') {
      return (
        <Button
          type="primary"
          icon="Checkmark"
          onClick={() => {
            setReportModalStatus(true);
          }}
        >
          Report Back
        </Button>
      );
    }
    if (lineReview.status === 'IGNORED' || lineReview.status === 'REVIEW') {
      return (
        <Button
          onClick={() => {
            setReportModalStatus(true);
          }}
        >
          Edit
        </Button>
      );
    }
    if (lineReview.status === 'RESOLVED') {
      return (
        <Button
          disabled
          onClick={() => {
            setReportModalStatus(true);
          }}
        >
          Resolved
        </Button>
      );
    }
    return null;
  };

  return (
    <LineReviewHeaderWrapper>
      <Button
        className="back-button"
        icon="ArrowBack"
        onClick={() => {
          history.push(PagePath.LINE_REVIEWS);
        }}
      />
      <section className="metadata">
        <h2>
          {lineReview.name} <StatusTag status={lineReview.status} />
        </h2>
        <p>{lineReview.description}</p>
        <p>
          LineReview found within the documents:{' '}
          {lineReview.documents.map((d) => d.fileExternalId).join(', ')}
        </p>
      </section>
      <section className="actions">
        {renderReportButton()}
        <span>Created {dayjs(lineReview.createdOn).format('DD/mm/YYYY')}</span>
        <span>
          Assigned to{' '}
          <strong>
            {lineReview.assignees.length > 0
              ? lineReview.assignees.map((assignee) => assignee.name).join(', ')
              : 'No one'}
          </strong>
        </span>
      </section>

      <Modal
        visible={isReportModalOpen}
        onCancel={() => {
          setReportModalStatus(false);
        }}
        footer={null}
      >
        <h2>Report back</h2>
        <p>
          You are about to send this report for further checking. The following
          lineReviews will be included in the report:
        </p>

        <div>
          <h3>{lineReview.name}</h3>
          <p>{lineReview.description}</p>
          <Input
            fullWidth
            placeholder="Additional information"
            value={additionalInformation.text}
            onChange={(e) => {
              setAdditionalInformation({
                text: e.target.value,
                user: { name: 'user' },
              });
            }}
          />
        </div>
        <footer
          style={{ marginTop: 16, display: 'flex', justifyContent: 'right' }}
        >
          <Button
            style={{ marginRight: 16 }}
            onClick={() => {
              onMarkStatus('IGNORED');
            }}
          >
            Ignore
          </Button>
          <Button
            onClick={() => {
              onMarkStatus('REVIEW');
            }}
            type="primary"
          >
            Validate onsite
          </Button>
        </footer>
      </Modal>
    </LineReviewHeaderWrapper>
  );
};

export default LineReviewHeader;
