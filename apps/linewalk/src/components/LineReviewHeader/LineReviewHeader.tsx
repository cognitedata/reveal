import { Button } from '@cognite/cogs.js';
import StatusTag from 'components/StatusTag';
import { LineReview } from 'modules/lineReviews/types';
import { PagePath } from 'pages/Menubar';
import { useHistory } from 'react-router';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px;
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

export type LineReviewHeaderProps = {
  lineReview: LineReview;
  onReportBackPress: () => void;
  onSaveToPdfPress: () => void;
};

const LineReviewHeader = ({
  lineReview,
  onSaveToPdfPress,
  onReportBackPress,
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
        </section>
      </HeaderContainer>
      <ActionContainer>
        <ButtonsContainer>
          <div>
            <Button
              type="ghost"
              icon="Print"
              onClick={() => onSaveToPdfPress()}
            />
          </div>
          <Button
            type="primary"
            icon="Checkmark"
            onClick={() => onReportBackPress()}
          >
            Report Back
          </Button>
        </ButtonsContainer>
      </ActionContainer>
    </Container>
  );
};

export default LineReviewHeader;
