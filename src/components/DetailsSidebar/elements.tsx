import styled from 'styled-components/macro';

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

export const Sidebar = styled.div<{ visible?: boolean }>`
  border-left: 1px solid var(--cogs-greyscale-grey4);
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  width: ${(props) => (props.visible ? '400px' : 0)};
  transition: 0s linear 200ms, width 200ms ease;
`;

export const Container = styled.div`
  padding: 20px;
`;

export const SourceItemWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  margin: 5px 0;
  max-width: 260px;
`;

export const SourceItemName = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const HistogramWrapper = styled.div`
  padding: 5px;
`;
