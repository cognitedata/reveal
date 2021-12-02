import React, { useContext, useEffect } from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { FileInfoSerializable } from 'store/file/types';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  selectBoundaryConditions,
  selectBoundaryConditionsChartsLink,
  selectBoundaryConditionsStatus,
} from 'store/boundaryCondition/selectors';
import {
  fetchBoundaryConditions,
  fetchBoundaryConditionChartsLink,
} from 'store/boundaryCondition/thunks';
import { RequestStatus } from 'store/types';
import { GenericInformationTable } from 'components/app/elements';

import { SequenceDataType } from './constants';
import { BoundaryConditionContainer } from './elements';

interface Props {
  data: FileInfoSerializable | undefined;
}

export const BoundaryConditionContent: React.FC<Props> = ({ data }) => {
  const { cdfClient, authState } = useContext(CdfClientContext);
  const dispatch = useAppDispatch();
  const displayValues = useAppSelector(selectBoundaryConditions);
  const displayValuesStatus = useAppSelector(selectBoundaryConditionsStatus);
  const chartsLink = useAppSelector(selectBoundaryConditionsChartsLink);

  const fetchDisplayValues = async () => {
    if (!data || !data.name) {
      return;
    }
    const filter = {
      metadata: {
        dataType: SequenceDataType.BCTimeSeriesMap,
        modelName: data.name,
      },
    };
    if (data.createdTime === undefined) {
      throw new Error('Selected file must have created time');
    }
    dispatch(
      fetchBoundaryConditions({
        client: cdfClient,
        createdTime: data.createdTime,
        filter,
      })
    );
    dispatch(
      fetchBoundaryConditionChartsLink({
        client: cdfClient,
        modelName: data.name,
        projectName: authState?.project,
        createdTime: data.createdTime,
        filter,
      })
    );
  };

  useEffect(() => {
    fetchDisplayValues();
  }, [data]);

  const failed = displayValuesStatus === RequestStatus.ERROR;
  const success = displayValuesStatus === RequestStatus.SUCCESS;

  return (
    <BoundaryConditionContainer>
      {success && (
        <>
          <GenericInformationTable>
            <caption>Boundary conditions</caption>
            <tbody>
              {displayValues.map((bc) => (
                <tr key={bc.label}>
                  <td className="label">{bc.label}</td>
                  <td className="value">
                    <Tooltip content={`Raw value: ${bc.rawValue}`}>
                      <span className="number">
                        {bc.value?.base}
                        {bc.value?.exponent !== 0 && (
                          <span>
                            {' '}
                            × 10<sup>{bc.value?.exponent}</sup>
                          </span>
                        )}
                      </span>
                    </Tooltip>
                    <span className="unit"> {bc.displayUnit}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </GenericInformationTable>

          <div className="charts-link">
            <Button
              type="primary"
              href={chartsLink}
              target="_blank"
              icon="LineChart"
            >
              Open in Charts
            </Button>
          </div>
        </>
      )}
      {failed && <div className="no-content">No boundary conditions</div>}
    </BoundaryConditionContainer>
  );
};
