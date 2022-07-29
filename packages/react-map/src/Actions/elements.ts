import styled from 'styled-components';

import { sizes } from '../elements';

const BaseContainer = styled.div`
  display: flex;
  height: 40px;
  border-radius: ${sizes.small};
  background-color: white;
  align-items: center;
  box-shadow: var(--cogs-z-4);
  padding: 2px;
`;

export const ActionContainer = styled(BaseContainer)`
  position: relative;
`;

export const ButtonContainer = styled(BaseContainer)``;

export const InfoContainer = styled(BaseContainer)`
  padding: 10px ${sizes.normal};
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  color: var(--cogs-greyscale-grey7);
`;

export const InfoMessage = styled.div`
  margin-left: 12px;
`;

export const InfoKey = styled.div`
  background: var(--cogs-greyscale-grey3);
  box-shadow: 0px 1px 0px var(--cogs-greyscale-grey4);
  border-radius: 2px;
  display: inline;
  padding: 0px 6px;
`;

export const InfoSeparator = styled.div`
  width: 1px;
  height: 20px;
  background: var(--cogs-greyscale-grey4);
  border-radius: 2px;
  margin-left: 12px;
`;
