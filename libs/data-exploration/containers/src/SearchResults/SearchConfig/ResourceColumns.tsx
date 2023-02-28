import { Divider } from '@cognite/cogs.js';
import {
  getTitle,
  ResourceType,
  SearchConfigColumnType,
  SearchConfigDataType,
} from '@data-exploration-lib/core';
import { ColumnHeader, CommonWrapper, ModalCheckbox } from './elements';

type Props = {
  data: SearchConfigDataType[];
  commonColumns: SearchConfigColumnType[];
  onChange: (
    isChecked: boolean,
    resource: ResourceType,
    column: SearchConfigColumnType
  ) => void;
};

export const ResourceColumns: React.FC<Props> = ({
  data,
  commonColumns,
  onChange,
}: Props) => {
  const commonColumnIds = commonColumns.map((column) => column.id);
  return (
    <>
      {data.map((configData) => {
        return (
          <div key={`${configData.resourceType}`}>
            <CommonWrapper direction="column">
              <ColumnHeader>
                {getTitle(configData.resourceType, true)}
              </ColumnHeader>
              {commonColumns.map((column) => {
                const commonColumn = configData.columns.find(
                  (col) => col.id === column.id
                );

                if (!commonColumn) return null;

                return (
                  <ModalCheckbox
                    key={`${configData.resourceType}_${column.id}`}
                    onChange={(_, isChecked) =>
                      onChange(!!isChecked, configData.resourceType, column)
                    }
                    name={commonColumn.label}
                    checked={commonColumn?.isChecked}
                  >
                    {commonColumn.label}
                  </ModalCheckbox>
                );
              })}
            </CommonWrapper>
            <Divider />
            <CommonWrapper direction="column">
              {configData.columns
                .filter((column) => !commonColumnIds.includes(column.id))
                .map((column) => (
                  <ModalCheckbox
                    key={`${configData.resourceType}_${column.id}`}
                    onChange={(_, isChecked) =>
                      onChange(!!isChecked, configData.resourceType, column)
                    }
                    checked={column.isChecked}
                    name={column.label}
                  >
                    {column.label}
                  </ModalCheckbox>
                ))}
            </CommonWrapper>
          </div>
        );
      })}
    </>
  );
};
