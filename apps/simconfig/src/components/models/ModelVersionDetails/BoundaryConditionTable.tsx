import React from 'react';

import classNames from 'classnames';
import styled from 'styled-components/macro';

import { Label, Tooltip } from '@cognite/cogs.js';
import type {
  BoundaryConditionValue,
  ModelFile,
} from '@cognite/simconfig-api-sdk/rtk';

import { CopyValue } from 'components/molecules/CopyValue';
import { getFormattedSciNumber } from 'utils/numberUtils';

interface BoundaryConditionTableProps {
  modelFile?: ModelFile;
  boundaryConditions?: BoundaryConditionValue[];
}

export function BoundaryConditionTable({
  modelFile,
  boundaryConditions,
}: BoundaryConditionTableProps) {
  if (!boundaryConditions?.length) {
    if (modelFile?.metadata.errorMessage !== undefined) {
      return (
        <ProcessingStatus icon="WarningTriangleFilled" variant="warning">
          Processing failed: {modelFile.metadata.errorMessage}
        </ProcessingStatus>
      );
    }
    return <ProcessingStatus icon="Loader">Processing...</ProcessingStatus>;
  }

  return (
    <BoundaryConditionsTableContainer>
      {boundaryConditions.map(
        ({ variableName, displayUnit, current, previous }, index) => (
          <div className="entry" key={variableName}>
            <div className="label">{variableName}</div>
            <div className="boundary-conditions">
              <CopyValue
                tooltip={
                  <React.Fragment key={`${variableName}-copy-value`}>
                    Copy raw value to clipboard: <code>{current}</code>
                  </React.Fragment>
                }
                value={current}
              />
              <div className="change">
                <Tooltip
                  content={
                    <>
                      Previous value:{' '}
                      {previous ? getFormattedSciNumber(previous) : 'n/a'}
                    </>
                  }
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                >
                  <>
                    {previous && previous > current ? (
                      <span className="lower" key={variableName}>
                        ▾
                      </span>
                    ) : null}
                    {previous && current > previous ? (
                      <span className="higher" key={variableName}>
                        ▴
                      </span>
                    ) : null}
                  </>
                </Tooltip>
              </div>
              <div
                className={classNames('value', {
                  'higher-value': previous && previous < current,
                  'lower-value': previous && previous > current,
                })}
              >
                <span>{getFormattedSciNumber(current)}</span>
              </div>
              <div className="unit">{displayUnit}</div>
            </div>
          </div>
        )
      )}
    </BoundaryConditionsTableContainer>
  );
}

const BoundaryConditionsTableContainer = styled.div`
  --columns-repeat: 2;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 6px;
  padding-left: 20px;
  .entry {
    margin-top: 20px;
  }
  .boundary-conditions {
    margin-top: 8px;
    display: flex;
    align-self: center;
    align-items: baseline;
    margin-left: -4px;
  }
  .change {
    overflow: visible !important;
  }
  .label {
    font-weight: 500;
  }
  .label,
  .value {
    color: #000000;
  }
  .value {
    overflow: visible;
  }
  .unit {
    opacity: 0.7;
    font-size: var(--cogs-detail-font-size);
    margin-left: 5px;
  }
  .higher,
  .lower {
    cursor: help;
  }
  .higher {
    color: var(--cogs-green-3);
  }
  .higher-value span {
    background: var(--cogs-green-8);
    color: var(--cogs-green-1);
  }
  .lower {
    color: var(--cogs-red-3);
  }
  .lower-value span {
    background: var(--cogs-red-8);
    color: var(--cogs-red-1);
  }
`;

const ProcessingStatus = styled(Label)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
`;
