import React from 'react';

import { Divider } from '@cognite/cogs.js';

import {
  FilterIdType,
  getTitle,
  SearchConfigDataType,
  SearchConfigResourceType,
} from '@data-exploration-lib/core';

import { ColumnHeader, CommonWrapper, ModalCheckbox } from './elements';

type Props = {
  searchConfigData: SearchConfigDataType;
  onChange: (
    enabled: boolean,
    resource: SearchConfigResourceType,
    filterId: FilterIdType
  ) => void;
};

export const ResourceColumns: React.FC<Props> = ({
  searchConfigData,
  onChange,
}: Props) => {
  const sizeOfCommonSection = 5;
  return (
    <>
      {(Object.keys(searchConfigData) as Array<SearchConfigResourceType>).map(
        (resource) => {
          const resourceFilterIds = Object.keys(
            searchConfigData[resource]
          ) as Array<FilterIdType>;

          return (
            <div key={`${resource}`}>
              <CommonWrapper direction="column">
                <ColumnHeader>{getTitle(resource, true)}</ColumnHeader>
                {resourceFilterIds.map((filterId, index) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore Property does not exist on type
                  const config = searchConfigData[resource][filterId];
                  return (
                    <React.Fragment key={`${resource}_${filterId}`}>
                      <ModalCheckbox
                        onChange={(_, isChecked) =>
                          onChange(!!isChecked, resource, filterId)
                        }
                        name={config?.label}
                        checked={config?.enabled}
                        data-testid={`modal-checkbox-${resource}-${filterId}`}
                      >
                        {config?.label}
                      </ModalCheckbox>
                      {index === sizeOfCommonSection - 1 && (
                        <Divider data-testid="search-config-divider" />
                      )}
                    </React.Fragment>
                  );
                })}
              </CommonWrapper>
            </div>
          );
        }
      )}
    </>
  );
};
