import { Button, Icon } from '@cognite/cogs.js';
import sortBy from 'lodash/sortBy';
import styled from 'styled-components';

import { WorkspaceDocument } from '../../modules/lineReviews/types';
import isNotUndefined from '../../utils/isNotUndefined';
import getKonvaSelectorSlugByExternalId from '../LineReviewViewer/getKonvaSelectorSlugByExternalId';
import { Discrepancy } from '../LineReviewViewer/LineReviewViewer';

const Container = styled.div`
  padding: 18px;
`;

const ApprovedDiscrepancyContainer = styled.div`
  background: rgba(244, 113, 139, 0.1);
  border: 1px solid #f4718b;
  border-radius: 6px;
  padding: 10px;
  color: #d51a46;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: pointer;
`;

const Title = styled.span`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.004em;
  font-feature-settings: 'cv08' on, 'ss04' on;
`;

const DocumentList = styled.div`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  font-feature-settings: 'cv08' on, 'ss04' on;
  color: #b30539;
  opacity: 0.4;
`;

const DiscrepancyListContainer = styled.div`
  > * {
    margin-bottom: 10px;
  }
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`;

const IconButton = styled.button`
  color: red;
  background: white;
  width: 28px;
  height: 28px;
  display: inline-flex;
  border: 1px solid #f4718b;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const MainContainer = styled.div``;
const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  > *:not(:last-child) {
    margin-right: 4px;
  }
`;

type DiscrepancyListItemProps = {
  comment?: string;
  number: number;
  onItemPress: () => void;
  onEditPress: () => void;
  onDeletePress: () => void;
  documentNames: string[];
};

const DiscrepancyListItem: React.FC<DiscrepancyListItemProps> = ({
  documentNames,
  number,
  comment,
  onItemPress,
  onEditPress,
  onDeletePress,
}) => {
  return (
    <ApprovedDiscrepancyContainer onClick={onItemPress}>
      <MainContainer>
        <Title>
          {number}. {comment}
        </Title>{' '}
        <DocumentList>
          {sortBy(documentNames).map((name) => (
            <>
              {name}
              <br />
            </>
          ))}
        </DocumentList>
      </MainContainer>
      <ActionsContainer>
        <IconButton onClick={onEditPress}>
          <Icon type="Edit" />
        </IconButton>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            onDeletePress();
          }}
        >
          <Icon type="Delete" />
        </IconButton>
      </ActionsContainer>
    </ApprovedDiscrepancyContainer>
  );
};

type Props = {
  documents: WorkspaceDocument[];
  discrepancies: Discrepancy[];
  onClosePress: () => void;
  onDiscrepancyPress: (id: string) => void;
  onDiscrepancyEditPress: (id: string) => void;
  onDiscrepancyDeletePress: (id: string) => void;
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;

  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  /* texts & icons/primary */

  color: #333333;
`;

const SidePanel: React.FC<Props> = ({
  documents,
  discrepancies,
  onDiscrepancyPress,
  onDiscrepancyEditPress,
  onDiscrepancyDeletePress,
  onClosePress,
}) => {
  return (
    <Container>
      <HeaderContainer>
        Marked discrepancies
        <Button
          icon="Close"
          type="ghost"
          aria-label="Close discrepancy list"
          onClick={onClosePress}
        />
      </HeaderContainer>
      {discrepancies.length === 0 && <div>No discrepancies marked yet.</div>}
      <DiscrepancyListContainer>
        {discrepancies.map((discrepancy, index) => (
          <DiscrepancyListItem
            documentNames={discrepancy.annotations
              .map(
                (annotation) =>
                  documents.find(
                    (document) =>
                      getKonvaSelectorSlugByExternalId(
                        document.pdfExternalId
                      ) === annotation.targetExternalId
                  )?.pdfExternalId
              )
              .filter(isNotUndefined)}
            number={index + 1}
            key={discrepancy.id}
            comment={discrepancy.comment}
            onItemPress={() => onDiscrepancyPress(discrepancy.id)}
            onEditPress={() => onDiscrepancyEditPress(discrepancy.id)}
            onDeletePress={() => onDiscrepancyDeletePress(discrepancy.id)}
          />
        ))}
      </DiscrepancyListContainer>
    </Container>
  );
};

export default SidePanel;
