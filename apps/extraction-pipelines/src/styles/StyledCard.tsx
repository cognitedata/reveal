import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export const Card2Sides = styled.div`
  flex: 1;
  display: flex;
  background: white;
  margin-right: 0.5rem;
  padding: 1rem;
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
    a {
      align-self: flex-end;
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
  margin-left: 2rem;
`;

export const CardWrapper = styled.div`
  display: flex;
  background: white;
  border-radius: 8px;
  & > div {
    flex: 1;
    margin: 1rem;
    border-right: 1px solid ${Colors['greyscale-grey2'].hex()};
    justify-content: space-between;
    &:last-child {
      border-right: none;
    }
  }
`;

export const CardInWrapper = styled.div`
  display: flex;
  flex-direction: column;
  a {
    align-self: flex-end;
    margin-right: 1rem;
  }
`;
