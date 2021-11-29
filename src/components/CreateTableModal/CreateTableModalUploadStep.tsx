import React from 'react';

import { Body, Button, Colors, Overline } from '@cognite/cogs.js';
import styled from 'styled-components';

import { CustomIcon } from 'components/CustomIcon';
import Message, { MessageType } from 'components/Message/Message';
import {
  SIDE_PANEL_TRANSITION_DURATION,
  SIDE_PANEL_TRANSITION_FUNCTION,
} from 'utils/constants';

type CreateTableModalUploadStepProps = {
  fileName?: string;
  isUploadFailed?: boolean;
  isUploadCompleted?: boolean;
  onCancel: () => void;
  progression?: number;
};

const CreateTableModalUploadStep = ({
  fileName,
  isUploadFailed = false,
  isUploadCompleted = false,
  onCancel,
  progression = 0,
}: CreateTableModalUploadStepProps): JSX.Element => {
  const percentage = isUploadCompleted ? 100 : progression;

  let messageContent = 'Please keep this window open to complete the upload.';
  let messageType: MessageType = 'info';
  if (isUploadFailed) {
    messageContent = 'An error has occurred while uploading your CSV.';
    messageType = 'error';
  } else if (isUploadCompleted) {
    messageContent = 'The file was successfully uploaded.';
    messageType = 'success';
  }

  return (
    <>
      <Message message={messageContent} type={messageType} />
      <StyledUploadStepWrapper>
        <CustomIcon
          icon="DocumentIcon"
          style={{ height: 40, marginRight: 16 }}
        />
        <StyledProgressionWrapper>
          <StyledProgressionInfo>
            <StyledFileName level={3} strong>
              {fileName}
            </StyledFileName>
            <StyledUploadPercentage level={3}>
              {percentage}%
            </StyledUploadPercentage>
          </StyledProgressionInfo>
          <StyledProgressionBarWrapper>
            <StyledProgressionBar
              $isUploadCompleted={isUploadCompleted}
              $percentage={percentage}
            />
          </StyledProgressionBarWrapper>
        </StyledProgressionWrapper>
        {!isUploadCompleted && !isUploadFailed && (
          <StyledCloseButton icon="Close" onClick={onCancel} type="ghost" />
        )}
      </StyledUploadStepWrapper>
    </>
  );
};

const StyledUploadStepWrapper = styled.div`
  align-items: center;
  border: 1px solid ${Colors['border-default']};
  border-radius: 6px;
  display: flex;
  margin-top: 16px;
  padding: 16px;
`;

const StyledProgressionWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledProgressionInfo = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 6px;
`;

const StyledFileName = styled(Body)`
  color: ${Colors['text-primary'].hex()};
`;

const StyledUploadPercentage = styled(Overline)`
  color: ${Colors['text-hint'].hex()};
  margin-left: auto;
`;

const StyledProgressionBarWrapper = styled.div`
  background-color: ${Colors['bg-control--disabled'].hex()};
  border-radius: 4px;
  height: 8px;
  width: 100%;
`;

const StyledProgressionBar = styled.div<{
  $isUploadCompleted: boolean;
  $percentage: number;
}>`
  background-color: ${({ $isUploadCompleted }) =>
    $isUploadCompleted
      ? Colors.success.hex()
      : Colors['bg-status-small--accent'].hex()};
  border-radius: 4px;
  height: 8px;
  transition: width ${SIDE_PANEL_TRANSITION_DURATION}s
    ${SIDE_PANEL_TRANSITION_FUNCTION};
  width: ${({ $percentage }) => $percentage}%;
`;

const StyledCloseButton = styled(Button)`
  margin-left: 8px;
`;

export default CreateTableModalUploadStep;
