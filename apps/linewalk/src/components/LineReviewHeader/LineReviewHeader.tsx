import { Button } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import StatusTag from 'components/StatusTag';
import Konva from 'konva';
import { LineReview } from 'modules/lineReviews/types';
import { PagePath } from 'pages/Menubar';
import { useHistory } from 'react-router';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  border-bottom: 1px solid #e8e8e8;
  padding: 32px 32px 0 32px;
  display: flex;
  justify-content: space-between;
`;

const HeaderContainer = styled.div`
  display: flex;
`;

const BackButtonContainer = styled.div`
  margin-right: 16px;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  > * {
    margin-right: 8px;
  }
`;

const AssigneeContainer = styled.div`
  margin: 12px 0;
`;

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
    <Container>
      <HeaderContainer>
        <BackButtonContainer>
          <Button
            className="back-button"
            icon="ChevronLeftLarge"
            onClick={() => {
              history.push(PagePath.LINE_REVIEWS);
            }}
          />
        </BackButtonContainer>
        <section className="metadata">
          <h2>
            {lineReview.name} <StatusTag status={lineReview.status} />
          </h2>
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
      </HeaderContainer>
      <ActionContainer>
        <ButtonsContainer>
          <Button type="secondary">...</Button>
          <Button
            type="primary"
            icon="Checkmark"
            onClick={() => onReportBackPress()}
          >
            Report Back
          </Button>
        </ButtonsContainer>
        <AssigneeContainer>
          Assigned to{' '}
          <strong>
            {lineReview.assignees.length > 0
              ? lineReview.assignees.map((assignee) => assignee.name).join(', ')
              : 'No one'}
          </strong>
        </AssigneeContainer>
      </ActionContainer>
    </Container>
  );
};

export default LineReviewHeader;
