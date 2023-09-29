import styled from 'styled-components';

import { Body, Chip, Flex } from '@cognite/cogs.js';

type MatchTypeOptionContentProps = {
  count: number;
  label: string;
};

const MatchTypeOptionContent = ({
  count,
  label,
}: MatchTypeOptionContentProps): JSX.Element => {
  return (
    <Container>
      <OptionLabel>{label}</OptionLabel>
      <OptionChip label={`${count}`} />
    </Container>
  );
};

const Container = styled(Flex).attrs({
  alignItems: 'center',
  gap: 8,
  justifyContent: 'space-between',
})`
  height: 100%;
`;

const OptionLabel = styled(Body).attrs({ level: 2 })`
  color: inherit;
`;

const OptionChip = styled(Chip).attrs({
  hideTooltip: true,
  size: 'x-small',
})`
  && {
    color: inherit;
  }
`;

export default MatchTypeOptionContent;
