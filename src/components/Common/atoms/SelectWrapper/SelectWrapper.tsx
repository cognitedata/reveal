import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

export const SelectWrapper = styled.div`
  .ant-select-selection {
    color: ${Colors['greyscale-grey8'].hex()};
    background-color: ${Colors['greyscale-grey2'].hex()};
    font-weight: 800;
    border: none;
    border-radius: 4px;
    width: '100%';
  }
`;
