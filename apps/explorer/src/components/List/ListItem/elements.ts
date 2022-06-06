import styled from 'styled-components';
import { sizes } from 'styles/layout';

interface ListItemStyleProps {
  selected: boolean;
}

const selectedStyles =
  'background: #f5f4ff; border: 2px solid rgba(147, 144, 255, 0.1);';
const regularStyles = `background: #f5f5f5; border: 2px solid rgba(218, 218, 218, 0.25);`;

export const ListItemStyle = styled.div<ListItemStyleProps>`
  display: flex;
  align-items: center;
  gap: ${sizes.normal};
  ${(props) => (props.selected ? selectedStyles : regularStyles)};
  padding: ${sizes.normal} ${sizes.small};
  margin-top: ${sizes.small};
  border-radius: ${sizes.normal};
  cursor: pointer;
  max-height: ${sizes.huge};
  min-height: ${sizes.huge};
`;
