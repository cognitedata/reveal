import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { NavLink } from 'react-router-dom';

export const Card2Sides = styled.div`
  flex: 1;
  display: flex;
  background: white;
  margin-right: 0.5rem;
  border-radius: 8px;
  &:last-child {
    margin-right: 0;
  }
  .card-section {
    display: flex;
    flex-direction: column;
    h2 {
      .cogs-icon {
        margin-right: 1rem;
      }
    }
    &:first-child {
      padding-right: 1rem;
      border-right: 1px solid ${Colors['greyscale-grey2'].hex()};
    }
    &:nth-child(2) {
      padding-left: 1rem;
      flex: 1;
    }
  }
`;

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
    border-right: 1px solid ${Colors['greyscale-grey3'].hex()};
    justify-content: space-between;
    color: ${Colors.black.hex()};
    &:last-child {
      border-right: none;
    }
  }
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
  .cogs-icon-ArrowRight {
    color: ${Colors.primary.hex()};
    grid-area: arrow;
    align-self: center;
    margin-right: 1rem;
    margin-left: auto;
  }
`;

export const CardNavLink = styled(NavLink)`
  .cogs-icon-ArrowRight {
    opacity: 0;
  }
  :hover {
    background-color: ${Colors['midblue-7'].hex()};
    .cogs-icon-ArrowRight {
      opacity: 1;
    }
  }
`;
