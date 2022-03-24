import styled from 'styled-components';

export const Overlay = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  height: 100%;
  overflow-y: auto;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const ListContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: var(--cogs-z-20);
  margin: auto;
  max-width: 900px;
  padding: 16px;
  position: relative;
  width: 90%;
`;

export const ListHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
`;

export const ListFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: right;
`;
