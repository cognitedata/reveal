import React, { PropsWithChildren, useState } from 'react';
import styled from 'styled-components';
import { Body, Button, Colors, Flex, Icon, Menu } from '@cognite/cogs.js';
import { Dropdown, Select } from 'antd';
import { useTranslation } from 'common/i18n';
import { getContainer } from 'utils/shared';

export type TableFilterValue = {
  labels?: string[];
};

type TableFilterProps = {
  labelOptions: string[];
  onApply?: () => void;
  onChange?: (updatedValue: TableFilterValue) => void;
  value: TableFilterValue;
};

const TableFilter = ({
  labelOptions,
  onApply,
  onChange,
  value = {},
}: PropsWithChildren<TableFilterProps>): JSX.Element => {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  const handleApply = () => {
    onApply?.();
    setIsVisible(false);
  };

  const handleClear = () => {
    onChange?.({});
  };

  const handleSelectedLabelChange = (updatedValue: string[]) => {
    onChange?.({
      ...value,
      labels: updatedValue,
    });
  };

  return (
    <Dropdown
      destroyPopupOnHide
      getPopupContainer={getContainer}
      overlay={
        <StyledMenu>
          <Flex gap={8} direction="column">
            <StyledMenuTitle>
              <Body level={2} strong>
                {t('filter-by')}
              </Body>
              <Button type="ghost" size="small" onClick={handleClear}>
                {t('clear-filters')}
              </Button>
            </StyledMenuTitle>
            <Flex gap={8} direction="column">
              <StyledMenuContent>
                <Flex direction="column" gap={8}>
                  <Body level="3" strong>
                    {t('label_one')}
                  </Body>
                  <Select<string[]>
                    allowClear
                    getPopupContainer={getContainer}
                    mode="multiple"
                    onChange={handleSelectedLabelChange}
                    options={labelOptions.map((label) => ({
                      label,
                      value: label,
                    }))}
                    value={value?.labels}
                    menuItemSelectedIcon={
                      <Icon
                        style={{ verticalAlign: 'middle' }}
                        type="Checkmark"
                      />
                    }
                    suffixIcon={<Icon type="ChevronDown" />}
                    placeholder={t('select-label')}
                  />
                </Flex>
              </StyledMenuContent>
              <Button type="primary" onClick={handleApply}>
                {t('apply')}
              </Button>
            </Flex>
          </Flex>
        </StyledMenu>
      }
      trigger={['click']}
      placement="bottomLeft"
      visible={isVisible}
      onVisibleChange={setIsVisible}
    >
      <Button icon="Filter" type="secondary" toggled={isVisible}>
        {t('filter')}
      </Button>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  &&& {
    padding: 16px;
    min-width: 300px;
    max-width: 300px;
  }
`;

const StyledMenuTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledMenuContent = styled.div`
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  padding: 12px;
`;

export default TableFilter;
