import { Button, Modal } from '@cognite/cogs.js';
import StatusTag from 'components/StatusTag';
import useLineReviews from 'modules/lineReviews/hooks';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import { PagePath } from 'pages/Menubar';
import { useState } from 'react';
import { useHistory } from 'react-router';

import { LineReviewHeaderWrapper } from './elements';

export type LineReviewHeaderProps = {
  lineReview: LineReview;
  onReportBackPress: () => void;
};

const LineReviewHeader = ({
  lineReview,
  onReportBackPress,
}: LineReviewHeaderProps) => {
  const history = useHistory();
  const { updateLineReview } = useLineReviews();
  const [isReportModalOpen, setReportModalStatus] = useState(false);
  // const [additionalInformation, setAdditionalInformation] = useState(
  //   lineReview.comments?.[0] || { text: '', user: { name: '' } }
  // );

  // --TODO: use or remove onMarkStatus
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onMarkStatus = (status: LineReviewStatus) => {
    const nextLineReview: LineReview = {
      ...lineReview,
      status,
      // comments: [additionalInformation],
    };
    updateLineReview(nextLineReview);
    setReportModalStatus(false);
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
        {/* <p>{lineReview.description}</p> */}
        <p>
          {lineReview.documents.map((document) => (
            <Button
              key={document.fileExternalId}
              type="link"
              onClick={() => {
                // eslint-disable-next-line no-alert
                window.alert('This zooms the document into the main viewport');
              }}
            >
              {document.fileExternalId}
            </Button>
          ))}
        </p>
      </section>
      <section className="actions">
        <Button
          type="primary"
          icon="Checkmark"
          onClick={() => onReportBackPress()}
        >
          Report Back
        </Button>
        <Button type="secondary">...</Button>
        {/* <span>Created {dayjs(lineReview.createdOn).format('DD/mm/YYYY')}</span> */}
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
          {/* <p>{lineReview.description}</p> */}
          {/* <Input */}
          {/*  fullWidth */}
          {/*  placeholder="Additional information" */}
          {/*  value={additionalInformation.text} */}
          {/*  onChange={(e) => { */}
          {/*    setAdditionalInformation({ */}
          {/*      text: e.target.value, */}
          {/*      user: { name: 'user' }, */}
          {/*    }); */}
          {/*  }} */}
          {/* /> */}
        </div>
        <footer
          style={{ marginTop: 16, display: 'flex', justifyContent: 'right' }}
        >
          {/* <Button */}
          {/*  style={{ marginRight: 16 }} */}
          {/*  onClick={() => { */}
          {/*    onMarkStatus('IGNORED'); */}
          {/*  }} */}
          {/* > */}
          {/*  Ignore */}
          {/* </Button> */}
          {/* <Button */}
          {/*  onClick={() => { */}
          {/*    onMarkStatus('REVIEW'); */}
          {/*  }} */}
          {/*  type="primary" */}
          {/* > */}
          {/*  Validate onsite */}
          {/* </Button> */}
        </footer>
      </Modal>
    </LineReviewHeaderWrapper>
  );
};

export default LineReviewHeader;
