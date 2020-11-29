import React from 'react';
import { mapIntegration } from '../../utils/integrationUtils';
import {
  DetailsCol,
  IntegrationFieldValue,
} from '../../components/table/details/DetailsCols';
import { Integration } from '../../model/Integration';

export const useIntegrationDetails = (integration: Integration) => {
  const datasource = mapIntegration(integration);
  const [data, setData] = React.useState<DetailsCol[]>(datasource);
  const [originalData] = React.useState(datasource);

  const updateDetails = (
    rowIndex: number,
    columnId: string,
    value: IntegrationFieldValue
  ) => {
    setData((old) => {
      return old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      });
    });
  };

  const undoUpdateDetails = (rowIndex: number) => {
    setData((old) => {
      return old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            value: originalData[rowIndex].value,
          };
        }
        return row;
      });
    });
  };

  return {
    detailsState: data,
    updateDetails,
    undoUpdateDetails,
  };
};
