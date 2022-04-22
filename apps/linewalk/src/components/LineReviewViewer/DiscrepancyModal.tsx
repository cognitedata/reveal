import { Button, Textarea } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

import { WorkspaceDocument } from '../../modules/lineReviews/types';

import getKonvaSelectorSlugByExternalId from './getKonvaSelectorSlugByExternalId';
import PopupModal from './PopupModal';
import { Discrepancy } from './LineReviewViewer';

type Props = {
  documents: WorkspaceDocument[];
  initialPosition: { x: number; y: number };
  initialDiscrepancy: Discrepancy;
  onSave: (discrepancy: Discrepancy) => void;
  onDeletePress: () => void;
  onClosePress: () => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  cursor: move;
  padding: 13px 16px 0 16px;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2px;
  cursor: text;
`;

const BodyContainer = styled.div`
  padding: 0 16px 13px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-grow: 1;
`;

const StyledTitle = styled.div`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;

  display: flex;
  align-items: center;
  letter-spacing: -0.01em;
  font-feature-settings: 'ss04' on;

  color: #333333;
`;

const FilenameLabel = styled.div`
  /* Text / Detail Strong */

  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;

  display: flex;
  align-items: center;

  /* texts & icons/hint */
  padding-bottom: 6px;

  color: rgba(0, 0, 0, 0.45);
`;

const DescriptionLabel = styled.div`
  /* Text / Body 2 Strong */
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  margin: 6px 0;
`;

const ActionsContainer = styled.div`
  margin-top: 16px;
  width: 100%;
  display: flex;
  justify-content: flex-start;
`;

const DescriptionTextArea = styled(Textarea)`
  width: 100%;
  height: 100%;
  resize: none;
`;

const DiscrepancyModal: React.FC<Props> = ({
  documents,
  initialPosition,
  initialDiscrepancy,
  onDeletePress,
  onSave,
  onClosePress,
}) => {
  const [comment, setComment] = React.useState(initialDiscrepancy.comment);

  const onSavePress = () => {
    onSave({
      ...initialDiscrepancy,
      comment,
    });
  };

  return (
    <PopupModal
      key={`${initialPosition.x}_${initialPosition.y}`}
      initialDimensions={initialPosition}
      renderFunc={({ onMove }) => (
        <Container>
          <Header onMouseDown={onMove}>
            <TitleContainer onMouseDown={(e) => e.stopPropagation()}>
              <StyledTitle>
                {initialDiscrepancy.status === 'pending' ? 'Create' : 'Edit'}{' '}
                discrepancy
              </StyledTitle>
              <FilenameLabel>
                On{' '}
                {
                  documents.find(
                    (document) =>
                      getKonvaSelectorSlugByExternalId(
                        document.pdfExternalId
                      ) === initialDiscrepancy.targetExternalId
                  )?.pdfExternalId
                }
              </FilenameLabel>
            </TitleContainer>
            <Button type="ghost" icon="Close" onClick={onClosePress} />
          </Header>

          <BodyContainer>
            <DescriptionLabel>Description</DescriptionLabel>
            <DescriptionTextArea
              placeholder="Describe the discrepancy..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              autoFocus
              resize={false}
            />
            <ActionsContainer>
              <Button
                style={{ marginRight: 8 }}
                onClick={onDeletePress}
                type="ghost"
              >
                Remove
              </Button>
              <Button
                type="primary"
                style={{ marginRight: 8 }}
                onClick={onSavePress}
              >
                Save
              </Button>
            </ActionsContainer>
          </BodyContainer>
        </Container>
      )}
    />
  );
};

export default DiscrepancyModal;
