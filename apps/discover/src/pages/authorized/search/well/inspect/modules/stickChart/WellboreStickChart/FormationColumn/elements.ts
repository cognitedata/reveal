import styled from 'styled-components/macro';

import { FlexColumn, sizes } from 'styles/layout';

export const WellTopName = styled.div`
  margin: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
`;

export const FormationWrapper = styled(FlexColumn)`
  width: 30px;
  border: 1px solid var(--cogs-greyscale-grey3);
  border-radius: 12px;
  background: var(--cogs-bg-accent);
  margin: ${sizes.small};
`;

export const ColorBox = styled.div`
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  background: ${(props: { color: string }) => props.color};
  height: ${(props: { height: number }) => props.height}px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FormationTops = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
