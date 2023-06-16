import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { IndustryCanvasService } from '../services/IndustryCanvasService';

export const SpaceDoesNotExistPage = (): JSX.Element => (
  <SpaceDoesNotExistContent>
    <Error>
      <Icon type="ErrorFilled" />
      <h3> Oops. Something went wrong.</h3>
    </Error>
    <div>
      <strong>
        The instance space '{IndustryCanvasService.INSTANCE_SPACE}', which is
        required for the Industrial Canvas application, was not successfully
        created. This should not happen.
      </strong>
    </div>
    <Instructions>
      If this issue persists, please reach out to support.
    </Instructions>
  </SpaceDoesNotExistContent>
);

const SpaceDoesNotExistContent = styled.div`
  padding: 80px 50px;
  height: 100%;
  overflow: auto;

  pre {
    user-select: text;
  }
`;

const Error = styled.div`
  font-size: 16px;
  color: var(--cogs-red-1);
  font-weight: bold;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  svg {
    margin-right: 1em;
  }
`;

const Instructions = styled.div`
  margin-top: 10px;
  margin-bottom: 20px;
`;
