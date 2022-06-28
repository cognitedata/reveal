/**
 * Common Elements
 */
import styled from 'styled-components/macro';

export const Sidebar = styled.div`
  border-left: 1px solid var(--cogs-greyscale-grey4);
  width: 450px;
  min-width: 450px;
  transition: 0s linear 200ms, width 200ms ease;
`;

export const TopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  padding: 9px 0 10px 10px;
`;

export const TopContainerTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
`;

export const TopContainerAside = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ContentOverflowWrapper = styled.div`
  height: calc(100% - 32px);
  overflow: auto;
`;

export const Container = styled.div`
  padding: 20px;
`;

export const SourceItemName = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const SourceItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  margin: 5px 0;
  max-width: 260px;
`;

export const SourceCircle = styled.span`
  height: 20px;
  width: 20px;
  background-color: ${(props) => props.color || 'lightgreen'};
  margin: 20px;
  margin-left: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: ${(props: { fade?: boolean }) => (props.fade ? '0.2' : '1')};
`;

export const SourceSquare = styled.span`
  height: 20px;
  width: 20px;
  background-color: ${(props) => props.color || 'lightgreen'};
  margin: 20px;
  margin-left: 5px;
  flex-shrink: 0;
  opacity: ${(props: { fade?: boolean }) => (props.fade ? '0.2' : '1')};
`;
