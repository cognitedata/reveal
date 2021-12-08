import { Operation } from '@cognite/calculation-backend';
import { Button, Modal } from '@cognite/cogs.js';
import { useState } from 'react';
import styled from 'styled-components/macro';
import ReactMarkdown from 'react-markdown';
import { NodeTypes } from '../types';
import { NodeWrapper } from './elements';

export type ActionBarProps = {
  nodeType: NodeTypes;
  toolFunction?: Operation;
  onEditClick?: () => void;
  onDuplicateClick?: () => void;
  onRemoveClick?: () => void;
};

const ActionBar = ({
  nodeType,
  toolFunction,
  onEditClick = () => {},
  onDuplicateClick = () => {},
  onRemoveClick = () => {},
}: ActionBarProps) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  return (
    <>
      <ActionContainer>
        {nodeType !== NodeTypes.SOURCE && (
          <Button
            type="ghost"
            icon="Edit"
            aria-label="Edit"
            onClick={() => onEditClick()}
          />
        )}
        <Button
          type="ghost"
          icon="Duplicate"
          aria-label="Duplicate"
          onClick={() => onDuplicateClick()}
        />
        <Button
          type="ghost"
          icon="Trash"
          aria-label="Remove"
          onClick={() => onRemoveClick()}
        />
        {nodeType === NodeTypes.FUNCTION &&
          toolFunction &&
          toolFunction.description && (
            <>
              <Divider />
              <Button
                type="ghost"
                icon="Info"
                aria-label="Info"
                onClick={() => setIsModalVisible(true)}
              />
            </>
          )}
      </ActionContainer>
      {toolFunction && toolFunction.description && (
        <InfoModal
          appElement={document.getElementsByTagName('body')}
          title={toolFunction.name}
          visible={isModalVisible}
          footer={null}
          onCancel={() => {
            setIsModalVisible(false);
          }}
          width={750}
        >
          <ReactMarkdown>{toolFunction.description}</ReactMarkdown>
        </InfoModal>
      )}
    </>
  );
};

const ActionContainer = styled(NodeWrapper)`
  width: fit-content;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  position: absolute;
  top: -40px;
`;

const InfoModal = styled(Modal)`
  .cogs-modal-header {
    border-bottom: none;
    font-size: var(--cogs-t3-font-size);
  }
`;

const Divider = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey3);
  height: 28px;
`;

export default ActionBar;
