import { Button } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import StatusTag from 'components/StatusTag';
import Konva from 'konva';
import { LineReview } from 'modules/lineReviews/types';
import { PagePath } from 'pages/Menubar';
import { useHistory } from 'react-router';

import { LineReviewHeaderWrapper } from './elements';

export type LineReviewHeaderProps = {
  lineReview: LineReview;
  onReportBackPress: () => void;
  ornateRef: CogniteOrnate | undefined;
};

const LineReviewHeader = ({
  lineReview,
  onReportBackPress,
  ornateRef,
}: LineReviewHeaderProps) => {
  const history = useHistory();

  return (
    <LineReviewHeaderWrapper>
      <Button
        className="back-button"
        icon="ChevronLeftLarge"
        onClick={() => {
          history.push(PagePath.LINE_REVIEWS);
        }}
      />
      <section className="metadata">
        <h2>
          {lineReview.name} <StatusTag status={lineReview.status} />
        </h2>
        <div>
          SPACEBAR + CLICK and DRAG to move around <br />
          SHIFT + CLICK elements in the PID to mark them as discrepancies.{' '}
          <br />
          ALT + CLICK to find the element in the ISO.
        </div>
        <p>
          {lineReview.documents.map((document) => (
            <Button
              key={document.fileExternalId}
              type="link"
              onClick={() => {
                if (ornateRef) {
                  const node = ornateRef.stage.findOne(
                    `#${document.id}`
                  ) as Konva.Group;

                  if (node) {
                    ornateRef.zoomToGroup(node, { scaleFactor: 0.85 });
                  }
                }
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
        <span>
          Assigned to{' '}
          <strong>
            {lineReview.assignees.length > 0
              ? lineReview.assignees.map((assignee) => assignee.name).join(', ')
              : 'No one'}
          </strong>
        </span>
      </section>
    </LineReviewHeaderWrapper>
  );
};

export default LineReviewHeader;
