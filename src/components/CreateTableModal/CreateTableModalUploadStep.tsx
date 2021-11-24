import React from 'react';

import { Body, Colors, Overline } from '@cognite/cogs.js';
import styled from 'styled-components';

import { CustomIcon } from 'components/CustomIcon';
import Message from 'components/Message/Message';

const CreateTableModalUploadStep = (): JSX.Element => {
  return (
    <>
      <Message
        message="Please keep this window open to complete the upload."
        type="info"
      />
      <StyledUploadStepWrapper>
        <CustomIcon
          icon="DocumentIcon"
          style={{ height: 40, marginRight: 16 }}
        />
        <StyledProgressionWrapper>
          <StyledProgressionInfo>
            <StyledFileName level={3} strong>
              Coruscant.csv
            </StyledFileName>
            <StyledUploadPercentage level={3}>60%</StyledUploadPercentage>
          </StyledProgressionInfo>
          <StyledProgressionBar />
        </StyledProgressionWrapper>
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

const StyledProgressionBar = styled.div`
  background-color: ${Colors['bg-status-small--accent'].hex()};
  border-radius: 4px;
  height: 8px;
  width: 100%;
`;

export default CreateTableModalUploadStep;
