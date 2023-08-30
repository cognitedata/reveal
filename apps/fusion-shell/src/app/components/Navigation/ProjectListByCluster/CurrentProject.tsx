import React from 'react';

import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';

type CurrentProjectProps = {
  projectName: string;
};

const CurrentProject = ({ projectName }: CurrentProjectProps): JSX.Element => {
  return (
    <StyledCurrentProject>
      {projectName}
      <StyledCurrentProjectIcon type="Checkmark" />
    </StyledCurrentProject>
  );
};

const StyledCurrentProject = styled.div`
  align-items: center;
  border-radius: 6px;
  color: ${Colors['text-icon--status-neutral']};
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 8px 12px;
`;

const StyledCurrentProjectIcon = styled(Icon)`
  color: ${Colors['text-icon--status-neutral']};
`;

export default CurrentProject;
