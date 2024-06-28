/*!
 * Copyright 2024 Cognite AS
 */
import { Flex, Icon, Menu, Radio } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import styled from 'styled-components';

type RuleBasedSelectionItemProps = {
  onChange: (value: string | undefined) => void;
  label: string;
  id: string;
  checked: boolean | undefined;
  key: string;
  isLoading: boolean;
};
export const RuleBasedSelectionItem = ({
  onChange,
  label,
  key,
  id,
  checked,
  isLoading,
}: RuleBasedSelectionItemProps): ReactElement => {
  return (
    <Menu.Item
      onClick={() => {
        onChange(id);
      }}
      key={key}>
      <StyledFlex justifyContent="space-between" alignItems="center" gap={8}>
        <Flex gap={4} alignItems="center">
          <Icon type="ColorPalette" />
          {label}
        </Flex>
        {isLoading && checked === true ? (
          <Icon type="Loader" />
        ) : (
          <Radio name={id ?? ''} value={id} checked={checked} />
        )}
      </StyledFlex>
    </Menu.Item>
  );
};

const StyledFlex = styled(Flex)`
  min-height: 24px;
`;
