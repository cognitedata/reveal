import styled from 'styled-components';

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  width: 326px;
  min-height: 96px;
  box-shadow: var(--cogs-z-4);
  padding: 13px;
  cursor: pointer;

  .recent-asset-card--icon {
    margin-right: 7px;
  }

  .recent-asset-card--description {
    flex-grow: 1;
    margin-top: 5px;
  }
`;

export const TagContainer = styled.div`
  margin-top: 10px;

  .cogs-tag {
    margin-right: 8px;
  }
`;
