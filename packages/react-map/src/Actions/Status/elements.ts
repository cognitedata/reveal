import styled from 'styled-components';

import { BaseContainer } from '../elements';
import { sizes } from '../../elements';

export const StatusContainer = styled(BaseContainer)`
  padding: 10px ${sizes.normal};
  font-weight: 500;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  color: var(--cogs-greyscale-grey7);
`;

export const StatusMessage = styled.div`
  margin-left: 12px;
`;

export const StatusKey = styled.div`
  background: var(--cogs-greyscale-grey3);
  box-shadow: 0px 1px 0px var(--cogs-greyscale-grey4);
  border-radius: 2px;
  display: inline;
  padding: 0px 6px;
`;

export const StatusSeparator = styled.div`
  width: 1px;
  height: 20px;
  background: var(--cogs-greyscale-grey4);
  border-radius: 2px;
  margin-left: 12px;
`;
