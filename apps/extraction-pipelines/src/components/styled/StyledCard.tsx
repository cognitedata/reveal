import { NavLink } from 'react-router-dom';

import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';

export const StyledTitleCard = styled.h2`
  display: flex;
  align-items: center;
  font-size: 1rem;
  .cogs-icon,
  .cogs-tag {
    margin: 0.5rem 1rem 0.5rem 0;
  }
  > span {
    margin-left: 1rem;
  }
`;
export const CardValue = styled.span`
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
`;

export const CardWrapper = styled.div`
  display: flex;
  background-color: white;
  border-radius: 1px;
  & > div,
  > a {
    flex: 1;
    border-right: 1px solid ${Colors['decorative--grayscale--300']};
    justify-content: space-between;
    color: ${Colors['decorative--grayscale--black']};
    &:last-child {
      border-right: none;
    }
  }
`;

export const CardNavLinkIcon = styled(Icon).attrs({ type: 'ArrowRight' })`
  visibility: hidden;
`;

export const CardInWrapper = styled.div`
  display: grid;
  grid-template-areas: 'title arrow' 'value arrow';
  grid-template-columns: auto 2rem;
  grid-auto-rows: minmax(2rem, auto);
  grid-column-gap: 1rem;
  padding: 1rem;
  height: 100%;
  .card-title {
    grid-area: title;
    justify-self: start;
  }
  .card-value {
    grid-area: value;
  }
  ${CardNavLinkIcon} {
    color: ${Colors['text-icon--interactive--default']};
    grid-area: arrow;
    align-self: center;
    margin-right: 1rem;
    margin-left: auto;
  }
`;

export const CardNavLink = styled(NavLink)`
  :hover {
    ${CardNavLinkIcon} {
      visibility: visible;
    }
  }
`;
