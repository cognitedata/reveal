import styled, { css } from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { AppliedThree3DData } from '../ThreeD/containers/AppliedThree3DData';

interface Props {
  inverted?: boolean;
}

export const SearchBarSwitch: React.FC<Props> = ({ inverted }) => {
  return (
    <Container inverted={inverted}>
      <Button type="secondary" icon="List" disabled={false} />
      <AppliedThree3DData />
    </Container>
  );
};

const Container = styled.div<{
  width?: string;
  inverted?: boolean;
}>`
  width: 92px;
  height: 52px;
  background-color: #ffffff;
  border-radius: 10px;
  padding: 8px;
  gap: 4px;
  display: flex;

  ${(props) => {
    if (props.inverted) {
      return css`
        background-color: #f3f4f8;
        outline: 1px solid rgba(210, 212, 218, 0.56);
      `;
    }

    return css`
      filter: drop-shadow(0px 1px 8px rgba(79, 82, 104, 0.06))
        drop-shadow(0px 1px 1px rgba(79, 82, 104, 0.1));
    `;
  }};
  border-radius: 10px;
`;
