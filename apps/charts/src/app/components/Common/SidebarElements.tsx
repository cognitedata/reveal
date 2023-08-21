/**
 * Common Elements
 */
import styled from 'styled-components/macro';

import {
  Icon,
  Switch,
  Collapse,
  Select,
  Chip,
  Skeleton,
} from '@cognite/cogs.js';

export const Toolbar = styled.aside`
  &&& {
    border-left: 1px solid var(--cogs-greyscale-grey4);
    width: 3.4375rem;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 4rem 10px 0;
    row-gap: 1rem;
  }
`;

export const Sidebar = styled.aside<{ visible?: boolean }>`
  &&& {
    border-left: 1px solid var(--cogs-greyscale-grey4);
    visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
    width: ${(props) => (props.visible ? '354px' : 0)};
    min-width: ${(props) => (props.visible ? '354px' : 0)};
    transition: 0s linear 200ms, width 200ms ease;
    position: relative;
    height: calc(100vh - 114px);
  }
`;

export const TopContainer = styled.header`
  &&& {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
    padding: 9px 0 10px 10px;
  }
`;

export const TopContainerTitle = styled.h2`
  &&& {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;

    > .cogs-icon {
      margin-right: 10px;
    }
  }
`;

export const TopContainerAside = styled.div`
  &&& {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

export const ContentOverflowWrapper = styled.article`
  &&& {
    /* height of header */
    height: calc(100% - 76px);
    overflow: auto;
  }
`;

export const OverlayContentOverflowWrapper = styled.article`
  &&& {
    height: calc(100% - 32px);
    overflow: auto;
    position: absolute;
    top: 3.5rem;
    width: 100%;
    background: rgba(255, 255, 255, 0.99);
  }
`;

export const ContentContainer = styled.div`
  height: 100%;
  .cogs-infobox__content {
    p {
      word-break: break-word;
    }
  }
  &&& {
    padding: 20px;
  }
`;

export const CollapsePanelTitle = styled.div`
  &&& {
    max-width: 90%;
  }
`;

export const SidebarCollapse = styled(Collapse)`
  &&& {
    background-color: white;

    .rc-collapse-item {
      border-radius: 4px;
      background-color: #f5f5f5;
      margin: 0 0 1rem;
      border: 0;

      > .rc-collapse-header {
        color: #595959;
        font-weight: 600;
        flex-direction: row-reverse;
        justify-content: space-between;
      }

      &:last-child > .rc-collapse-content {
        border-radius: 0 0 0.75rem 0.75rem;
      }
    }

    .rc-collapse-content {
      background-color: #f5f5f5;
      overflow: visible;
      border-radius: 0 0 0.75rem 0.75rem;
      padding-bottom: 1px;
    }

    .rc-collapse-content-box {
      margin-bottom: 15px;
    }

    .cogs-select__control {
      background-color: white;
    }
    .cogs-switch.disabled input[type='checkbox']:hover + .switch-ui {
      background: var(--cogs-greyscale-grey3);
    }
  }
`;

export const SidebarInnerCollapse = styled(Collapse)`
  &&& {
    border: 0;
    padding: 0;
    margin: 0.5rem 0 0;

    .rc-collapse-item {
      > .rc-collapse-header {
        padding-left: 0;
        padding-right: 0;
        background: none;
        border: 0;
        justify-content: start;
        flex-direction: row-reverse;
        background-color: #f5f5f5;
        font-weight: 500;
        color: var(--cogs-text-icon--interactive--default);

        .cogs-icon {
          width: 12px !important;
          margin-left: 0.5rem;
        }
      }

      > .rc-collapse-content {
        padding-left: 0;
        padding-right: 0;
        background-color: #f5f5f5;
      }
    }

    .rc-collapse-content > .rc-collapse-content-box {
      margin-top: 0;
    }
  }
`;

export const SidebarInnerBox = styled.div`
  &&& {
    background-color: white;
    border-radius: 4px;
    font-size: 10px;
    padding: 0.7rem 0.5rem;
    margin: 1rem 0;
    color: #000;

    p {
      margin: 0;
      line-height: 1.6;
    }
  }
`;

export const SidebarChip = styled(Chip)<{ $small?: boolean }>`
  &&& {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 500;
    padding: ${(props) => `${props.$small ? `2px 6px` : `4px 8px`}`};
    vertical-align: ${(props) => `${props.$small ? `sub` : ``}`};

    .cogs-label--icon {
      &.cogs-label--icon-left {
        margin-right: ${(props) => `${props.$small ? `3px` : `6px`}`};
      }

      .cogs-label--icon,
      .cogs-icon {
        width: ${(props) => `${props.$small ? `10px` : `16px`}`};
        height: ${(props) => `${props.$small ? `10px` : `16px`}`};
      }
    }

    &.cogs-label--variant-default {
      color: var(--cogs-text-icon--status-undefined);
      background: rgba(102, 102, 102, 0.1);
    }
  }
`;

export const SourceSelect = styled(Select)`
  &&& {
    width: 100%;
    margin-bottom: 1em;

    .cogs-select--title {
      padding-left: 6px;
      > .cogs-icon {
        background: ${(props) => props.iconBg || '#bfbfbf'};
        color: white;
        width: 20px !important;
        padding: 2px;
        border-radius: 4px;
      }
    }
  }
`;

export const FilterSelect = styled(Select)`
  &&& {
    width: 100%;
    .cogs-select__menu {
      right: 0;
      min-width: 6.5rem;
    }
  }
`;

export const SidebarHeaderActions = styled.header`
  &&& {
    display: flex;
    margin-bottom: 1rem;
    justify-content: space-between;
  }
`;

export const SidebarFooterActions = styled.footer`
  margin-top: 1rem;

  span[role='button'].cogs-popconfirm-wrapper {
    max-width: 40px;
    display: inline-block;
  }
`;

export const ReverseSwitch = styled(Switch)`
  order: 2;
  margin: 0 0 0 0.5rem;
`;

export const ExpandIcon = styled(Icon)<{ $active: boolean }>`
  margin-right: 8px;
  transition: transform 0.2s;
  transform: ${(props) => `rotate(${props.$active ? -180 : 0}deg)`};
`;

export const FormTitle = styled.h2`
  &&& {
    font-size: 18px;
    font-weight: 600;
    margin-top: 1em;
  }
`;

export const SidebarFormLabel = styled.p<{ $first?: boolean }>`
  font-weight: 400;
  margin: 1rem 0 0.5rem;
  margin: ${(props) => `${props.$first ? '0 0 0.5rem' : '1rem 0 0.5rem'}`};
`;

export const LoadingWrap = styled.div`
  margin-bottom: 1rem;

  > div:first-child {
    margin-right: 1rem;
  }
`;

export const SmallSelect = styled(Select)`
  &&& {
    .cogs-select__control {
      min-height: 24px;
      border-width: 1px;
    }

    .cogs-select--title {
      line-height: 16px;
    }

    .cogs-select__indicator {
      padding: 5px;
    }
  }
`;

export const LoadingRow = ({
  lines = 2,
  showCircle = true,
}: {
  lines?: number;
  showCircle?: boolean;
}) => (
  <LoadingWrap>
    {showCircle && <Skeleton.Circle diameter="24px" />}
    <Skeleton.Rectangle height="24px" width="16rem" />
    {lines % 2 === 0 ? (
      <>
        <Skeleton.Paragraph lines={lines / 2} />
        <br />
        <Skeleton.Paragraph lines={lines / 2} />
      </>
    ) : (
      <Skeleton.Paragraph lines={lines} />
    )}
  </LoadingWrap>
);
