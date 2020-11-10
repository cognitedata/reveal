import styled from 'styled-components/macro';

export const SuiteTileContainer = styled.div`
  display: inline-flex;
  min-width: 208px;
  background-color: var(--cogs-white);
  border-radius: 4px;
  border: 1px solid var(--cogs-greyscale-grey4);
  margin: 10px 10px 0 0;
`;

export const TileDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 8px;
`;

export const DashboardTileContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  width: 300px;
  background-color: var(--cogs-white);
  border-radius: 2px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.08), 0px 2px 2px rgba(0, 0, 0, 0.08);
  margin: 24px 48px 0 0;
`;

export const DashboardTileHeader = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  & > :last-child {
    margin-left: auto;
  }
`;

export const DashboardTilePreview = styled.div`
  height: 184px;
  background-color: var(--cogs-greyscale-grey3);
`;
