import styled from 'styled-components/macro';
import { Collapse, Flex } from '@cognite/cogs.js';

export const Container = styled.div`
  padding: 16px;
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  div {
    margin-bottom: 4px;
  }

  .cogs-graphic,
  .cogs-label {
    margin: 16px 0;
  }

  &.processes {
    margin: 15vh 0;
  }
  &.workflows {
    margin: 25vh 0;
  }
`;

export const FlexContainer = styled(Flex)`
  font-family: 'Inter';
  flex-direction: column;
  gap: 20px;
  border-bottom: 1px solid var(--cogs-border-default);
  padding: 16px 64px;
  background-color: var(--cogs-surface--medium);

  .external-id {
    .cogs-body-2 {
      margin-bottom: 6px;
    }

    .input-wrapper {
      width: 100%;

      .cogs-input {
        cursor: default;
        width: 100%;
        border: none;
        color: var(--cogs-text-icon--muted);

        &.cogs-input-default:disabled {
          background: var(--cogs-surface--interactive--disabled--alt);
          &:hover {
            border: none;
          }
        }
      }
    }

    .cogs-btn {
      border-radius: 0 6px 6px 0;
      &:not(:hover) {
        background: var(--cogs-surface--interactive--disabled--alt);
      }
    }
  }
`;

export const MetadataContainer = styled(Flex)`
  flex-wrap: wrap;
  gap: 20px;

  .cogs-body-2 {
    margin-bottom: 4px;
    width: 30vw;
    overflow-wrap: anywhere;
  }
`;

export const CollapseContainer = styled(Collapse)`
  font-family: 'Inter';
  margin-bottom: 16px;
  background-color: var(--cogs-surface--medium);
  border-radius: 8px;

  .cogs-body-2 {
    margin: 0;
  }

  .cogs-icon {
    margin-left: auto;
    transition: transform 0.2s;
  }

  .rc-collapse-item:last-child > .rc-collapse-content {
    border-radius: 0 0 8px 8px;
    border-collapse: separate;
    background: var(--cogs-surface--medium);
    border-top: 1px solid var(--cogs-border-default);
  }
`;

export const Header = styled.span`
  display: flex;
  align-items: center;
  height: 68px;
  border-bottom: 1px solid var(--cogs-border-default);
  padding: 12px;
  background-color: var(--cogs-surface--medium);

  div {
    display: flex;
    flex-direction: column;
    padding-left: 16px;

    .cogs-detail {
      color: var(--cogs-text-icon--muted);
    }
  }

  .cogs-label {
    margin-left: auto;
  }
`;

export const CellWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: fit-content;
  margin-left: auto;

  .cogs-btn {
    margin-right: 4px;
  }
`;

export const CollapseHeader = styled.span`
  display: flex;
  width: 100%;

  .cogs-icon {
    transform: rotate(${(props) => (!props.theme.showMetadata ? 0 : -180)}deg);
    margin-left: auto;
  }
`;
