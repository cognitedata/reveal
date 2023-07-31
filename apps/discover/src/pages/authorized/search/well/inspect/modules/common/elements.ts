import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Button } from '@cognite/cogs.js';

import { Flex, FlexRow, sizes } from 'styles/layout';

export const ModuleLoaderWrapper = styled.div`
  text-align: center;
  padding-top: 200px;
`;

export const PreviewSelectorWrapper = styled.div`
  display: inline-block;
  width: 100%;
  margin-top: ${sizes.normal};
`;

export const PreviewModeWrapper = styled.div`
  float: right;
  margin-right: ${sizes.normal};
`;

export const PreviewButtonWrapper = styled.div`
  float: right;
`;

export const ModuleFilterDropdownWrapper = styled(Flex)`
  margin: 10px 0;
  position: relative;
  z-index: ${layers.FILTER_BOX};
  width: fit-content;
`;

export const ButtonGroupWrapper = styled.div`
  .MuiToggleButton-root {
    color: #595959;
    border-radius: 0;
    border-bottom: none;
    padding: ${sizes.normal};
    font-size: 10px;
    box-sizing: border-box;
    font-weight: 700;
    line-height: 1.75;
    letter-spacing: unset;

    > .MuiToggleButton-label {
      min-width: 130px;
      height: 34px;
      overflow: hidden;
      display: flex;
    }
  }
`;

export const MessageWrapper = styled.div`
  text-align: center;
  padding-top: 200px;
`;

export const HorizontalTrack = styled.div`
  min-width: 100%;
  z-index: ${layers.SCROLLBAR};
  bottom: 0;
`;

export const WellboreSelectionRow = styled(FlexRow)`
  width: 100%;

  & > * .cogs-select__option--is-selected {
    background-color: var(--cogs-white) !important;
  }
`;

export const WellboreDropdownWrapper = styled.div``;

export const WellboreNameWrapper = styled(FlexRow)`
  width: 100%;
`;

export const WellboreNameDiv = styled.div`
  width: auto;
`;

export const WellboreDropdownFlex = styled.div`
  flex: 4;
`;

export const WellboreSelectContainer = styled.div`
  flex: 1;
  background-color: var(--cogs-greyscale-grey2);
  border-radius: 6px;
`;

export const WellboreSelectionButton = styled(Button)`
  width: 200px;
  justify-content: start;
  background: var(--cogs-greyscale-grey2);
  border: ${(props: { visible: string }) =>
    props.visible === 'true'
      ? '2px solid var(--cogs-midblue)'
      : '2px solid var(--cogs-white)'};
`;

export const WellboreSelectionButtonContainer = styled.div`
  display: inherit;
  width: 100%;
  padding-top: 2px;
`;

export const WellboreSelectionButtonLabel = styled.span`
  justify-content: start;
  text-align: start;
  font-weight: 600;
`;

export const WellboreSelectionButtonValue = styled.span`
  padding-left: 6px;
  justify-content: start;
  text-align: start;
`;

export const WellboreSelectionImageContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  position: relative;
  bottom: 2px;
  color: var(--cogs-greyscale-grey6);
`;
