import React, { useState, useEffect } from 'react';

import { SecurityCategory } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { Select, Spin, Tooltip } from 'antd';
import { useTranslation } from 'common/i18n';

const { Option } = Select;

interface SecurityCategoriesSelector {
  value: number[];
  onChange(newSelectedResources: number[]): void;
}

interface DisplayCategory {
  key: SecurityCategory['id'];
  label: SecurityCategory['name'];
  notAvailable?: boolean;
}

const SecurityCategorySelector = ({
  value = [],
  onChange = () => {},
}: SecurityCategoriesSelector) => {
  const { t } = useTranslation();
  const sdk = useSDK();
  const [fetching, setFetching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<
    DisplayCategory[]
  >([]);
  const [securityCategories, setSecurityCategories] = useState<
    DisplayCategory[]
  >([]);

  useEffect(() => {
    onChange(selectedCategories.map((resource) => resource.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories]);

  const fetchSecurityCategories = async () => {
    try {
      const retrievedResources = await sdk.securityCategories
        .list()
        .autoPagingToArray({ limit: -1 });
      const newResources = retrievedResources.map((resource) => ({
        key: resource.id,
        label: resource.name,
      }));
      const selectedValues: DisplayCategory[] = value.map((id) => {
        const category: DisplayCategory = securityCategories.find(
          (sc) => String(sc.key) === String(id)
        ) || {
          key: Number(id),
          label: t('text-not-available'),
          notAvailable: true,
        };
        return category;
      });
      setSelectedCategories(selectedValues);
      setFetching(false);
      setSecurityCategories(newResources);
    } catch (e) {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSecurityCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Select
        mode="multiple"
        value={selectedCategories.map((c) => c.key)}
        placeholder={t('security-category-selector-placeholder')}
        notFoundContent={fetching ? <Spin /> : t('text-not-found')}
        filterOption={false}
        onChange={(v) =>
          setSelectedCategories(
            securityCategories.filter((c) => v.includes(c.key))
          )
        }
        style={{ border: 0 }}
      >
        {securityCategories.map((securityCategory) => (
          <Option
            key={securityCategory.key}
            value={securityCategory.key}
            disabled={
              securityCategory.notAvailable &&
              !selectedCategories.find(
                (cat) => cat.key === securityCategory.key
              )
            }
          >
            <Tooltip
              title={
                securityCategory.notAvailable &&
                t('security-category-not-available-info', {
                  key: securityCategory.key,
                })
              }
            >
              <>{securityCategory.label || <i>{t('text-no-name')}</i>}</>
            </Tooltip>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default SecurityCategorySelector;
