import React, { PropsWithChildren, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Body, Button, Colors, Flex, Icon, Menu } from '@cognite/cogs.js';
import { Dropdown, Input, Select } from 'antd';
import { useTranslation } from 'common/i18n';
import { getContainer } from 'utils/shared';
import { useSearchParamState } from 'hooks/useSearchParamState';
import useDebounce from 'hooks/useDebounce';
import AppliedFilters from 'components/applied-filters';

type TableFilterProps = {
  labelOptions: string[];
};

const TableFilter = ({
  labelOptions,
}: PropsWithChildren<TableFilterProps>): JSX.Element => {
  const { t } = useTranslation();

  const [searchFilter, setSearchFilter] = useSearchParamState<string>('search');
  const [labelFilter, setLabelFilter] = useSearchParamState<string[]>('labels');

  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(
    searchFilter
  );
  const debouncedSearchQuery = useDebounce(searchQuery);

  useEffect(() => {
    setSearchFilter(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchFilter]);

  const [tempSelectedLabels, setTempSelectedLabels] = useState<
    string[] | undefined
  >(labelFilter);

  const handleApply = () => {
    setLabelFilter(tempSelectedLabels);
    setIsVisible(false);
  };

  const handleClear = () => {
    handleClearLabelFilter();
    setIsVisible(false);
  };

  const handleClearLabelFilter = () => {
    setTempSelectedLabels(undefined);
    setLabelFilter(undefined);
  };

  const handleSelectedLabelChange = (updatedValue: string[]) => {
    setTempSelectedLabels(updatedValue.length ? updatedValue : undefined);
  };

  return (
    <Flex direction="column" gap={8}>
      <Flex gap={8}>
        <StyledInputContainer>
          <Input
            prefix={<Icon type="Search" />}
            placeholder={t('search-by-name')}
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            allowClear
          />
        </StyledInputContainer>
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
                        value={tempSelectedLabels}
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
      </Flex>
      <Flex>
        <AppliedFilters
          items={
            !!labelFilter?.length
              ? [
                  {
                    key: 'labels',
                    label: t('label-with-colon', {
                      labels: labelFilter?.join(', '),
                    }),
                    onClick: handleClearLabelFilter,
                  },
                ]
              : []
          }
          onClear={handleClearLabelFilter}
        />
      </Flex>
    </Flex>
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

const StyledInputContainer = styled.div`
  width: 220px;
`;

export default TableFilter;
