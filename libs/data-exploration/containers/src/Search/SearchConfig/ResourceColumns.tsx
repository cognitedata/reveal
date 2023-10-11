import React from 'react';

import { Divider } from '@cognite/cogs.js';

import {
  FilterIdType,
  getTitle,
  SearchConfigDataType,
  SearchConfigResourceType,
  useTranslation,
} from '@data-exploration-lib/core';

import { ColumnHeader, CommonWrapper, ModalCheckbox } from './elements';

type Props = {
  searchConfigData: SearchConfigDataType;
  onChange: (
    enabled: boolean,
    resource: SearchConfigResourceType,
    filterId: FilterIdType
  ) => void;
  isDocumentsApiEnabled?: boolean;
};

export const ResourceColumns: React.FC<Props> = ({
  searchConfigData,
  onChange,
  isDocumentsApiEnabled = true,
}: Props) => {
  const sizeOfCommonSection = 5;
  const { t } = useTranslation();
  return (
    <>
      {(Object.keys(searchConfigData) as Array<SearchConfigResourceType>)
        .filter((resourceType) => {
          return !(resourceType === 'file' && !isDocumentsApiEnabled);
        })
        .map((resource) => {
          const resourceFilterIds = Object.keys(
            searchConfigData[resource]
          ) as Array<FilterIdType>;
          const title = getTitle(resource, true);

          return (
            <CommonWrapper
              key={resource}
              data-testid={`search-config-${title}`}
              direction="column"
            >
              <ColumnHeader>
                {t(`${title.split(' ').join().toUpperCase()}`, title)}
              </ColumnHeader>
              {resourceFilterIds.map((filterId, index) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore Property does not exist on type
                const config = searchConfigData[resource][filterId];
                const label = config.label || '';

                const disableCheckboxWithFuzzySearchConfig =
                  config.label === 'Content' && !config.enabledFuzzySearch;

                return (
                  <React.Fragment key={`${resource}_${filterId}`}>
                    <ModalCheckbox
                      onChange={(_, isChecked) =>
                        onChange(!!isChecked, resource, filterId)
                      }
                      name={config?.label}
                      checked={
                        config?.enabled && !disableCheckboxWithFuzzySearchConfig
                      }
                      data-testid={`modal-checkbox-${resource}-${filterId}`}
                      id={`modal-checkbox-${resource}-${filterId}`}
                      disabled={disableCheckboxWithFuzzySearchConfig}
                    >
                      {t(`${label.split(' ').join('_').toUpperCase()}`, label)}
                    </ModalCheckbox>
                    {index === sizeOfCommonSection - 1 && (
                      <Divider data-testid="search-config-divider" />
                    )}
                  </React.Fragment>
                );
              })}
            </CommonWrapper>
          );
        })}
    </>
  );
};
