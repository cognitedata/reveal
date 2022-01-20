import { Button } from '@cognite/cogs.js';
import { DocumentType } from '@cognite/pid-tools';
import styled from 'styled-components';

const SidePanelOverlay = styled.div`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const ButtonWrapper = styled.div`
  text-align: center;
`;

const SelectButton = styled(Button)`
  margin: 4px;
  font-size: 1.25em;
`;

interface DocumentTypeSelectorProps {
  setDocumentType: (type: DocumentType) => void;
}

export const DocumentTypeSelector = ({
  setDocumentType,
}: DocumentTypeSelectorProps) => {
  const selectType = (type: DocumentType) => {
    setDocumentType(type);
  };

  return (
    <SidePanelOverlay>
      <h2>Please select document type</h2>
      <ButtonWrapper>
        <SelectButton onClick={() => selectType(DocumentType.pid)}>
          P&ID
        </SelectButton>
        <SelectButton onClick={() => selectType(DocumentType.isometric)}>
          ISO
        </SelectButton>
      </ButtonWrapper>
    </SidePanelOverlay>
  );
};
