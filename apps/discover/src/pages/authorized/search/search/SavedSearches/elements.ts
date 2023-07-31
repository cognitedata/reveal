import styled from 'styled-components/macro';

import { Button, Detail, Menu } from '@cognite/cogs.js';

import { Flex, FlexAlignItems, sizes } from 'styles/layout';

export const SavedSearchInputWrapper = styled(Flex)`
  width: 100%;
  & > .cogs-input-container {
    width: 100%;

    & > * .input-wrapper {
      width: 100%;
    }
  }
  & > * input {
    width: 100%;
    border: 1px solid var(--cogs-greyscale-grey4) !important;
    ::placeholder {
      color: var(--cogs-greyscale-grey6);
      font-weight: 500;
    }
  }
`;

export const SavedSearchWrapper = styled(FlexAlignItems)`
  margin-right: ${sizes.small};
  margin-left: ${sizes.small};
`;

export const SavedSearchesButton = styled(Button)``;

export const SavedSearchListContent = styled.div`
  margin-top: ${sizes.small};
  max-height: 60vh;
  overflow-y: auto;
  width: 100%;
`;
export const SavedSearchTitle = styled(Detail)`
  padding: ${sizes.small};
  color: var(--cogs-greyscale-grey6);
`;

export const SavedSearchDivider = styled.div`
  margin-top: ${sizes.small};
  margin-right: -4px; // need to ignore parent padding of the "Menu" component
  margin-left: -4px;
`;

export const MenuItemWrapper = styled(Menu.Item)`
  text-align: left;
`;
