import styled from 'styled-components';

export const SidebarWrapper = styled.div`
  width: 280px;
`;

export const Header = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  padding: 14px;
  & .cogs-icon {
    margin-right: 4px;
  }
  .event-sidebar--type,
  .event-sidebar--subtype {
    margin-left: 8px;
    text-transform: uppercase;
    word-break: break-word;
  }
`;

export const Content = styled.section`
  background-color: var(--cogs-greyscale-grey1);
  padding: 18px;
  .event-sidebar--content-item:not(:last-child) {
    margin-bottom: 12px;
  }
  .event-sidebar--title {
    text-transform: uppercase;
    font-size: 12px;
  }
  .event-sidebar--value {
    font-size: 13px;
  }
`;

export const Actions = styled.section`
  padding: 17px 5px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--cogs-border-default);
  .event-sidebar--share-btn {
    & .cogs-icon {
      margin-right: 8px;
    }
  }
`;

export const Metadata = styled.section`
  font-size: 12px;
  .event-sidebar--details {
    margin-bottom: 12px;
  }
  & > div:nth-child(even) {
    background-color: var(--cogs-bg-accent);
  }
`;

export const MetadataItem = styled.div`
  padding: 12px;
  .cogs-body-2 {
    margin-bottom: 3px;
  }
  .cogs-body-3 {
    font-weight: 400;
  }
`;
