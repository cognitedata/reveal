import React, { useEffect } from 'react';
import { batch, useDispatch } from 'react-redux';

import { Row, Col } from '@cognite/cogs.js';

import { useDeepMemo } from 'hooks/useDeep';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { nptDataMapToMultiSelect } from 'modules/wellSearch/utils/npt';

import { useNptDataForTable } from '../hooks/useNptDataForTable';
import { getNptFilterOptions } from '../utils/getNptFilterOptions';

import { NPTCodeFilter } from './NPTCodeFilter';
import { NPTDetailCodeFilter } from './NPTDetailCodeFilter';
import { NPTDurationFilter } from './NPTDurationFilter';
import { NPTFilterByName } from './NPTFilterByName';

export const FilterContainer: React.FC<{
  isVisible: boolean;
}> = React.memo(({ isVisible }) => {
  const { data, nptCodeDefinitions, nptDetailCodeDefinitions } =
    useNptDataForTable();

  const dispatch = useDispatch();

  const { minMaxDuration, nptCodes, nptDetailCodes } = useDeepMemo(
    () => getNptFilterOptions(data),
    [data]
  );

  const processedNptCodes = nptDataMapToMultiSelect(
    nptCodes,
    nptCodeDefinitions
  );
  const processedNptDetailCodes = nptDataMapToMultiSelect(
    nptDetailCodes,
    nptDetailCodeDefinitions
  );

  useEffect(() => {
    batch(() => {
      dispatch(inspectTabsActions.setNptDuration(minMaxDuration));
      dispatch(inspectTabsActions.setNptCode(nptCodes));
      dispatch(inspectTabsActions.setNptDetailCode(nptDetailCodes));
    });
  }, []);

  if (!isVisible) return null;

  return (
    <Row>
      <Col span={5}>
        <NPTFilterByName />
      </Col>

      <Col span={7}>
        <NPTDurationFilter minMaxDuration={minMaxDuration} />
      </Col>

      <Col span={6}>
        <NPTCodeFilter nptCodes={processedNptCodes} />
      </Col>

      <Col span={6}>
        <NPTDetailCodeFilter nptDetailCodes={processedNptDetailCodes} />
      </Col>
    </Row>
  );
});
