import { useState } from 'react';
import { IntegrationFieldValue } from '../../components/table/details/DetailsCols';

export type TableName = 'contacts' | 'details';

export interface Change extends RemoveChange {
  value: IntegrationFieldValue;
}
export interface RemoveChange {
  rowIndex: number;
  tableName: TableName;
}

export const useDetailsGlobalChanges = () => {
  // eslint-disable-next-line
  //TODO remvoe
  const [changes, setChanges] = useState<Change[]>([]);

  const addChange = ({ rowIndex, tableName, value }: Change) => {
    setChanges((old) => {
      return [...old, { rowIndex, value, tableName }];
    });
  };
  const removeChange = ({ rowIndex, tableName }: RemoveChange) => {
    setChanges((old) => {
      return old.filter((o) => {
        return !(o.rowIndex === rowIndex && o.tableName === tableName);
      });
    });
  };

  return {
    changes,
    addChange,
    removeChange,
  };
};
