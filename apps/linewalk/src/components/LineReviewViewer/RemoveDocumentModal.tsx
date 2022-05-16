import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import layers from 'utils/z';

import withoutFileExtension from './withoutFileExtension';

const ContentContainer = styled.div`
  width: 400px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 12px 16px 16px;
`;

const TitleContainer = styled.div`
  /* Title / T5 */

  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  /* identical to box height, or 125% */

  display: flex;
  align-items: center;
  letter-spacing: -0.01em;
  font-feature-settings: 'ss04' on;

  /* texts & icons/primary */

  color: #333333;
  margin-bottom: 22px;

  justify-content: space-between;
  flex-direction: row;
`;

const Text = styled.div`
  /* Text / Body 2 */

  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  /* or 143% */

  font-feature-settings: 'cv08' on, 'ss04' on;

  /* texts & icons/primary */

  color: #333333;

  margin-bottom: 22px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  > * {
    margin-left: 8px;
  }
`;

type RemoveDocumentModalProps = {
  documentName: string;
  onOkPress: () => void;
  onCancelPress: () => void;
};

const RemoveDocumentModal: React.FC<RemoveDocumentModalProps> = ({
  documentName,
  onOkPress,
  onCancelPress,
}) => (
  <div
    style={{
      zIndex: layers.REMOVE_DOCUMENT_MODAL,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <ContentContainer style={{ backgroundColor: 'white', width: 400 }}>
      <TitleContainer>
        <span>Remove document from workspace</span>
        <Button
          type="ghost"
          variant="ghost"
          icon="Close"
          onClick={onCancelPress}
        />
      </TitleContainer>

      <Text>
        Are you sure you want to remove{' '}
        <b>{withoutFileExtension(documentName)}</b> from this workspace? This
        will also remove all discrepancies and annotations on this document.
      </Text>

      <ButtonsContainer>
        <Button onClick={onCancelPress} variant="ghost">
          Cancel
        </Button>
        <Button onClick={onOkPress} type="danger">
          Remove
        </Button>
      </ButtonsContainer>
    </ContentContainer>
  </div>
);

export default RemoveDocumentModal;
