import React, { useState } from 'react';
import { Row, Collapse, Input, Pagination, message, Select } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Button, Icon } from '@cognite/cogs.js';
import { Function } from 'types';
import CallFunctionModal from 'components/FunctionModals/CallFunctionModal';
import {
  functionsSortedRecentlyCreated,
  retrieve as retrieveFunctions,
  functionsSortedLastCallSelector,
} from 'modules/retrieve';
import { selectFunctionToCall } from 'modules/call';
import { getFunctionsCalls } from 'modules/functionCalls';
import {
  loadSchedules,
  selectSchedulesState,
  getSchedulesCalls,
} from 'modules/schedules';
import UploadFunctionModal from 'components/FunctionModals/UploadFunctionModal';
import FunctionPanelHeader from 'containers/Functions/FunctionPanelHeader';
import styled from 'styled-components';
import FunctionPanelContent from 'containers/Functions/FunctionPanelContent';

const CollapseDiv = styled.div`
  .ant-collapse-header[aria-expanded='true'] {
    background-color: ${Colors['midblue-6'].hex()};
  }
`;

function Functions() {
  const sortedFunctionsRecentlyCreated = useSelector(
    functionsSortedRecentlyCreated
  );
  const sortedFunctionsLastCall = useSelector(functionsSortedLastCallSelector);
  const { items: schedules, error: getSchedulesError } = useSelector(
    selectSchedulesState
  );
  const functionToRun = useSelector(selectFunctionToCall);
  const dispatch = useDispatch();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [functionFilter, setFunctionFilter] = useState('');
  type SortFunctions = 'recentlyCreated' | 'recentlyCalled';
  const [sortFunctionCriteria, setSortFunctionCriteria] = useState<
    SortFunctions
  >('recentlyCalled');
  const FUNCTIONS_PER_PAGE = 10;
  const { Panel } = Collapse;

  const filteredAndSortedFunctions = () => {
    let sortedFunctions;
    switch (sortFunctionCriteria) {
      case 'recentlyCreated':
        sortedFunctions = sortedFunctionsRecentlyCreated;
        break;
      case 'recentlyCalled':
        sortedFunctions = sortedFunctionsLastCall;
        break;
      default:
        sortedFunctions = sortedFunctionsRecentlyCreated;
    }

    return (
      sortedFunctions?.filter((f: Function) =>
        [f.name, f.externalId || '', f.owner || '']
          .join('')
          .toLowerCase()
          .includes(functionFilter.toLowerCase())
      ) || []
    );
  };

  const handleRefreshFunctions = () => {
    dispatch(retrieveFunctions([], true));
    dispatch(getFunctionsCalls());
    dispatch(loadSchedules());
    dispatch(getSchedulesCalls());
  };

  const functionsDisplay = (allFunctions: Function[]) => {
    return (
      <CollapseDiv>
        <Collapse>
          {allFunctions
            .slice(
              (currentPage - 1) * FUNCTIONS_PER_PAGE,
              currentPage * FUNCTIONS_PER_PAGE
            )
            .map((currentFunction: Function) => {
              return (
                <Panel
                  key={currentFunction.id}
                  header={
                    <FunctionPanelHeader currentFunction={currentFunction} />
                  }
                >
                  <FunctionPanelContent currentFunction={currentFunction} />
                </Panel>
              );
            })}
        </Collapse>
        <Pagination
          current={currentPage}
          total={allFunctions.length}
          defaultPageSize={FUNCTIONS_PER_PAGE}
          onChange={page => setCurrentPage(page)}
          style={{ float: 'right' }}
        />
      </CollapseDiv>
    );
  };

  const numberOfFunctions = filteredAndSortedFunctions().length;
  const numberOfSchedules = schedules ? schedules.length : 0;
  React.useEffect(() => {
    dispatch(retrieveFunctions([], true));
    dispatch(loadSchedules());
  }, [dispatch]);

  React.useEffect(() => {
    dispatch(getFunctionsCalls());
  }, [dispatch, numberOfFunctions]);

  React.useEffect(() => {
    dispatch(getSchedulesCalls());
  }, [dispatch, numberOfFunctions, numberOfSchedules]);

  React.useEffect(() => {
    if (getSchedulesError) {
      message.error('Could not get schedules');
    }
  }, [getSchedulesError]);

  return (
    <>
      <Row>
        <h1 style={{ display: 'inline-block' }}>Functions</h1>
        <div
          style={{
            float: 'right',
            marginTop: '8px',
            display: 'inline-flex',
          }}
        >
          <Button
            icon="Upload"
            type="primary"
            onClick={() => setShowUploadModal(true)}
          >
            Upload function
          </Button>
          <Button
            icon="Refresh"
            onClick={handleRefreshFunctions}
            style={{ marginLeft: '8px' }}
          >
            Refresh
          </Button>
        </div>
      </Row>
      <Input
        name="filter"
        prefix={
          <Icon
            type="Search"
            style={{
              height: '16px',
              width: '16px',
            }}
          />
        }
        placeholder="Search by name, external id, or owner"
        value={functionFilter}
        onChange={evt => setFunctionFilter(evt.target.value)}
        allowClear
      />
      <b>Sort by: </b>
      <Select
        style={{
          width: '200px',
          marginTop: '8px',
        }}
        value={sortFunctionCriteria}
        onChange={(value: SortFunctions) => setSortFunctionCriteria(value)}
      >
        <Select.Option value="recentlyCalled">Recently Called</Select.Option>
        <Select.Option value="recentlyCreated">Recently Created</Select.Option>
      </Select>
      <div style={{ marginTop: '8px' }}>
        {functionsDisplay(filteredAndSortedFunctions())}
        <CallFunctionModal visible={!!functionToRun} />
        <UploadFunctionModal
          visible={showUploadModal}
          onCancel={() => setShowUploadModal(false)}
        />
      </div>
    </>
  );
}

export default Functions;
