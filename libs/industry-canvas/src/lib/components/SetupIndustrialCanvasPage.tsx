import styled from 'styled-components';

import { Button, Tooltip } from '@cognite/cogs.js';

import { IndustryCanvasService } from '../services/IndustryCanvasService';

type SetupIndustrialCanvasPageProps = {
  hasDataModelWriteAcl: boolean;
  isCreatingSpace: boolean;
  onCreateSpace: () => void;
};

export const SetupIndustrialCanvasPage: React.FC<
  SetupIndustrialCanvasPageProps
> = ({ hasDataModelWriteAcl, onCreateSpace, isCreatingSpace }) => (
  <SetupIndustrialCanvasContent>
    <InfoContainer>
      <h3> Industrial Canvas has not been set up yet</h3>
    </InfoContainer>
    <div>
      <strong>
        Before you can start using Industrial Canvas, the space '
        <samp>{IndustryCanvasService.INSTANCE_SPACE}</samp>' needs to be
        created. Please contact your IT admin to do this, or use the button
        below if you have the necessary capabilities.
      </strong>
    </div>
    <CreateSpaceButtonWrapper>
      <Tooltip
        disabled={hasDataModelWriteAcl}
        content="datamodels:write is required to set up Industrial Canvas"
      >
        <StyledButton
          disabled={!hasDataModelWriteAcl}
          onClick={onCreateSpace}
          type="primary"
          loading={isCreatingSpace}
        >
          Set up Industrial Canvas
        </StyledButton>
      </Tooltip>
    </CreateSpaceButtonWrapper>
  </SetupIndustrialCanvasContent>
);

const SetupIndustrialCanvasContent = styled.div`
  padding: 80px 50px;
  height: 100%;
  overflow: auto;
  max-width: 960px;
  margin: auto;
  position: relative;

  pre {
    user-select: text;
  }
`;

const CreateSpaceButtonWrapper = styled.div`
  position: absolute;
  left: 40%;
`;

const StyledButton = styled(Button)`
  margin-top: 25px;
`;

const InfoContainer = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  text-align: center;
`;
