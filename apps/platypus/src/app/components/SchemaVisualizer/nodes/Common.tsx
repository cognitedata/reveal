import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  align-items: center;
  *:not(:first-child) {
    margin-left: 4px;
  }
`;

export const PropertyItem = styled.div`
  display: flex;
  margin-top: 8px;
  .property-name {
    color: var(--cogs-greyscale-grey9);
    flex: 1;
  }
  .property-type {
    text-align: end;
    display: flex;
    align-items: center;
    * {
      margin-left: 6px;
    }
  }
`;
