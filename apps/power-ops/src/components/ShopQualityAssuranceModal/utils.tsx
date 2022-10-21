import { Column, CellProps } from 'react-table';
import { SOLVER_STATUS_TYPES, ShopRunPenalties } from 'types';
import { CogniteEvent } from '@cognite/sdk';
import { Label } from '@cognite/cogs.js';
import { OpenInFusion } from 'components/OpenInFusion/OpenInFusion';
import { CellWrapper } from 'pages/Workflows/elements';
import { useMemo } from 'react';
import { BidProcessResult, WORKFLOW_TYPES } from '@cognite/power-ops-api-types';

export const isNewBidMatrixAvailable = (
  processFinishEvent: CogniteEvent,
  currentBidProcessExternalId: string
): boolean => {
  const parentProcessEventExternalId =
    processFinishEvent.metadata?.event_external_id;

  return !!(
    parentProcessEventExternalId &&
    parentProcessEventExternalId !== currentBidProcessExternalId &&
    parentProcessEventExternalId.includes(
      WORKFLOW_TYPES.DAY_AHEAD_BID_MATRIX_CALCULATION
    )
  );
};

export const shopRunPenaltiesColumns: Column<ShopRunPenalties>[] = [
  {
    accessor: 'watercourse',
    Header: 'Watercourse',
  },
  {
    accessor: 'scenario',
    Header: 'Scenario',
  },
  {
    accessor: 'sumPenalties',
    Header: 'Sum Penalties',
    Cell: ({ value }) => <>{Math.round(value)}</>,
  },
  {
    accessor: 'solverStatus',
    Header: 'Solver Status',
    Cell: ({ value }) =>
      value === SOLVER_STATUS_TYPES.INFEASIBLE ? (
        <Label size="medium" variant="danger">
          {value}
        </Label>
      ) : (
        <Label size="medium" variant="success">
          {value}
        </Label>
      ),
  },
  {
    accessor: 'sequenceId',
    disableSortBy: true,
    Cell: ({ value }: CellProps<any>) =>
      useMemo(
        () => (
          <CellWrapper>
            <OpenInFusion type="sequence" endPoint="sequences" id={value} />
          </CellWrapper>
        ),
        [value]
      ),
  },
];

export const shopPenaltiesExceedLimit = (
  bidProcessResult: BidProcessResult
) => {
  if (!bidProcessResult) return false;
  return bidProcessResult.priceScenarios.some((scenario) =>
    scenario.objectives?.some(
      (objective) =>
        objective.solverStatus !== SOLVER_STATUS_TYPES.OPTIMAL ||
        objective.sumPenalties > 42
    )
  );
};
