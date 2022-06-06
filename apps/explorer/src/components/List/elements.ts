import { sizes } from 'styles/layout';
import styled from 'styled-components';
import { Body } from '@cognite/cogs.js';

export const ListStyles = styled.div`
  margin: 0 ${sizes.medium};
  display: flex;
  flex-direction: column;
`;

export const SectionWrapper = styled.div`
  margin-top: ${sizes.medium};
`;

export const SectionTitle = styled(Body)`
  text-transform: 'capitalize';
`;
