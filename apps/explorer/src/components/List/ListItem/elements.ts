import styled from 'styled-components';
import { sizes } from 'styles/layout';

interface ListItemStyleProps {
  selected: boolean;
}

export const ListItemStyle = styled.div<ListItemStyleProps>`
  display: flex;
  align-items: center;
  gap: ${sizes.normal};
  padding: 0 ${sizes.small};
  margin-top: ${sizes.small};
  border-radius: ${sizes.normal};
  cursor: pointer;
  max-height: ${sizes.large};
  min-height: ${sizes.large};
`;

export const ListItemTextWrapper = styled.div`
  flex: 1;
  width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
