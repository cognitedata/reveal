import { Button, Col, Dropdown, Icon, Menu, Title } from '@cognite/cogs.js';
import { SidebarCollapseWrapped } from 'components/MonitoringSidebar/elements';
import { Sidebar } from 'components/Common/SidebarElements';
import styled from 'styled-components';

export const DividerLine = styled.div`
  border: 1px solid lightgray;
  position: relative;
  top: -8px;
`;

export const JobContainer = styled.div`
  padding: 0em 1em;
  background: var(--cogs-surface--strong);
  padding-bottom: 1em;
`;

export const AlertContainer = styled.div`
  font-weight: normal;
  margin-bottom: 5px;
`;

export const TimeseriesContainer = styled.div`
  position: relative;
  top: -1.2em;
  font-size: 90%;
  i {
    position: relative;
    top: 3px;
    margin-right: 4px;
  }
`;

export const ConditionContainer = styled.div`
  position: relative;
  top: -2em;
  font-size: 90%;
  font-weight: normal;
`;

export const EmptyStateContainer = styled.div`
  width: 100%;
  height: calc(100vh - 300px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const JobsWithAlertsContainer = styled.div`
  padding: 1em;
`;

export const EmptyStateHeader = styled.div`
  font-weight: bold;
  font-size: 1.2em;
`;

export const EmptyStateText = styled.div`
  padding: 1em 2em;
  text-align: center;
`;

export const EmptyStateTitle = styled(Title)`
  font-weight: bold;
  margin-bottom: 10pt;
`;

export const EmptyStateButton = styled(Button)`
  margin-top: 1em;
`;

export const EmptyStateButtonIcon = styled(Icon)`
  margin-left: 10px;
`;

export const AlertText = styled(Col)`
  position: relative;
  top: 7px;
`;

export const AlertAction = styled(Button)`
  &&& {
    background-color: var(--cogs-surface--status-warning--muted--default);
    border: 0;
    padding: 0;
    color: var(--cogs-text-icon--status-warning);
    font-weight: bold;
    padding: 0em 1em;
    i {
      margin-left: 1em;
    }
  }
`;

export const AlertActionTitle = styled.div`
  &&& {
    font-size: 80%;
    margin-bottom: 0.5em;
  }
`;

export const ModalBody = styled.div`
  &&& {
    margin: 1em 0em;
  }
`;

export const StatusSelectMenu = styled.div``;

export const DropdownMenuItem = styled(Menu.Item)`
  i {
    position: relative;
    top: 0px;
    margin-right: 5px;
  }
`;

export const DropdownMenuItemDelete = styled(DropdownMenuItem)`
  color: var(--cogs-text-icon--status-critical);
`;

export const MonitoringSidebarBlueButton = styled(Button)`
  &&& {
    margin-top: 1em;
    color: var(--cogs-text-icon--status-neutral);
    background: var(--cogs-surface--status-neutral--muted--default);
    font-size: 0.9em;
    height: 26px;
    padding: 0px 7px;
    i {
      font-size: 0.8em;
      margin-left: 0.7em;
    }
  }
`;

export const MonitoringSidebarEllipsis = styled(Icon)`
  &&& {
    color: var(--cogs-text-icon--status-neutral);
    background: var(--cogs-surface--status-neutral--muted--default);
    padding: 5px;
    border-radius: 5px;
    cursor: pointer;
    top: 0px;
  }
`;

export const SidebarCollapseAlert = styled(SidebarCollapseWrapped)`
  &&& {
    .rc-collapse-item {
      margin: 0 0 1rem;
      border: 0;
      border-top: 0;
      margin-bottom: 15px;
      position: relative;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
  }
`;

export const SidebarWithScroll = styled(Sidebar)`
  overflow-y: auto;
`;

export const DropdownActionAlerts = styled(Dropdown)``;
