import { Collapse, Icon, Select } from '@cognite/cogs.js';
import styled from 'styled-components';

export const ExpandIcon = styled(Icon)<{ isActive: boolean }>`
  margin-right: 8px;
  transition: transform 0.2s;
  transform: ${(props) => `rotate(${props.isActive ? -180 : 0}deg)`};
`;

export const ThresholdLabel = styled.p`
  font-weight: bold;
  margin: 1rem 0 0.5rem;
`;

export const ThresholdCollapse = styled(Collapse)`
  background-color: white;

  .rc-collapse-item {
    border-radius: 0.75rem;
    background-color: #fafafa;
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
    background-color: #fafafa;
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
`;

export const FilterCollapse = styled(Collapse)`
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
      background-color: #fafafa;
      font-weight: 600;

      .cogs-icon {
        width: 12px !important;
        margin-left: 0.5rem;
      }
    }

    > .rc-collapse-content {
      padding-left: 0;
      padding-right: 0;
      background-color: #fafafa;
    }
  }

  .rc-collapse-content > .rc-collapse-content-box {
    margin-top: 0;
  }
`;

export const ThresholdMetadata = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.7rem 0.5rem 0.5rem;
  margin: 1rem 0;

  p {
    margin: 0;
    line-height: 1.6;
  }
`;

export const ThresholdMetadataValue = styled.span`
  display: block;
  color: #333;
  font-weight: 500;
  font-size: 0.875rem;
`;

export const SourceSelect = styled(Select)`
  width: 100%;
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
`;

export const FilterSelect = styled(Select)`
  width: 100%;
  .cogs-select__menu {
    right: 0;
    min-width: 6.5rem;
  }
`;
