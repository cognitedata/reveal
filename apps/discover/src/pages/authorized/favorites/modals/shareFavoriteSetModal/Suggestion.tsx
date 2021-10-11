import React from 'react';

import styled from 'styled-components/macro';

import { Typography } from 'components/typography';
import { User } from 'modules/user/types';
import { FlexColumn, FlexGrow } from 'styles/layout';
import { Theme } from 'styles/types';
import { useTheme } from 'styles/useTheme';

const Suggestion = styled(FlexGrow)`
  align-items: start;
  height: auto;
  width: 100%;
  cursor: pointer;
  padding: 10px 5px;

  &:hover {
    background-color: ${(props: { theme: Theme }) =>
      props.theme.palette.black.opacity10};
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
  const theme = useTheme();

  if (!suggestion) return null;
  return (
    <div role="menuitem">
      <Suggestion theme={theme} as={FlexColumn}>
        <NamePlate user={suggestion} />
        <Typography variant="label" weight="regular">
          {suggestion.email}
        </Typography>
      </Suggestion>
    </div>
  );
};

export default SuggestionComponent;
