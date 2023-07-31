import * as React from 'react';

import styled from 'styled-components/macro';

import { User } from '@cognite/discover-api-types';

import { Typography } from 'components/Typography';
import { FlexColumn, FlexGrow } from 'styles/layout';

const Suggestion = styled(FlexGrow)`
  align-items: start;
  height: auto;
  width: 100%;
  cursor: pointer;
  padding: 10px 5px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
  }
`;

interface NamePlateProps {
  user: User;
}

const NamePlate: React.FC<NamePlateProps> = (props) => {
  const { user } = props;
  const firstname = user.firstname || '';
  const lastname = user.lastname || '';
  return (
    <Typography variant="body1" weight="regular">
      {firstname} {lastname}
    </Typography>
  );
};

interface SuggestionComponentProps {
  suggestion?: User;
}

const SuggestionComponent: React.FC<SuggestionComponentProps> = (props) => {
  const { suggestion } = props;

  if (!suggestion) {
    return null;
  }
  return (
    <div role="menuitem">
      <Suggestion as={FlexColumn}>
        <NamePlate user={suggestion} />
        <Typography variant="label" weight="regular">
          {suggestion.email}
        </Typography>
      </Suggestion>
    </div>
  );
};

export default SuggestionComponent;
