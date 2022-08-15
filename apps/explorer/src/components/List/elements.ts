import { sizes } from 'styles/layout';
import styled from 'styled-components';
import { Body, Menu } from '@cognite/cogs.js';

export const ListStyles = styled(Menu)`
  max-height: 350px;
  overflow: scroll;
  background: white;
  opacity: 0.92;
  border-radius: ${sizes.small};
  padding: ${sizes.small};
`;

export const SectionWrapper = styled.div`
  margin-bottom: ${sizes.medium};
`;

export const SectionTitle = styled(Body)`
  text-transform: capitalize;
`;
