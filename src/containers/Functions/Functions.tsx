import React, { useState } from 'react';
import { Row, Collapse, Input, Pagination, Select, Alert } from 'antd';
import { Colors, Button, Icon } from '@cognite/cogs.js';

import styled from 'styled-components';

import { PageTitle } from '@cognite/cdf-utilities';
import { CogFunction } from 'types';

import { recentlyCreated, sortLastCall } from 'utils/sorting';
import FunctionPanelHeader from 'containers/Functions/FunctionPanelHeader';
import FunctionPanelContent from 'containers/Functions/FunctionPanelContent';
import UploadFunctionButton from 'components/buttons/UploadFunctionButton';

import {
  useActivateFunction,
  useCheckActivateFunction,
  useFunctions,
  useMultipleCalls,
  useRefreshApp,
} from 'utils/hooks';
import { Loader } from 'components/Common';

const CollapseDiv = styled.div`
  .ant-collapse-header[aria-expanded='true'] {
    background-color: ${Colors['midblue-6'].hex()};
  }
`;

const FunctionActivationAlert = styled(Alert)`
  margin: 2rem 0;
`;

const FUNCTIONS_PER_PAGE = 10;

function Functions() {
  const refresh = useRefreshApp();
  const [currentPage, setCurrentPage] = useState(1);

  const [functionFilter, setFunctionFilter] = useState('');
  type SortFunctions = 'recentlyCreated' | 'recentlyCalled';
  const [sortFunctionCriteria, setSortFunctionCriteria] = useState<
    SortFunctions
  >('recentlyCalled');

  const {
    data: functions,
    isFetching,
    isFetched: functionsDone,
  } = useFunctions();

  const functionIds = functions
    ?.sort(({ id: id1 }, { id: id2 }) => id1 - id2)
    .map(({ id }) => ({ id }));

  const { data: calls, isFetched: callsDone } = useMultipleCalls(functionIds!, {
    enabled: functionsDone && functionIds,
  });

  const { Panel } = Collapse;
  const sortFn =
    sortFunctionCriteria === 'recentlyCalled' && calls
      ? sortLastCall(calls)
      : recentlyCreated;

  const { data: activation, isLoading } = useCheckActivateFunction();
  const [mutate] = useActivateFunction();

  const sortedFunctions = functions?.sort(sortFn);
  const filteredFunctions = sortedFunctions?.filter((f: CogFunction) =>
    [f.name, f.externalId || '', f.owner || '']
      .join('')
      .toLowerCase()
      .includes(functionFilter.toLowerCase())
  );

  if (isLoading) {
    return <Loader />;
  }

  if (activation?.status === 'activated') {
    return (
      <>
        <PageTitle title="Functions" />
        <Row>
          <h1 style={{ display: 'inline-block' }}>Functions</h1>
          <div
            style={{
              float: 'right',
              marginTop: '8px',
              display: 'inline-flex',
            }}
          >
            <UploadFunctionButton />

            <Button
              icon={isFetching || !callsDone ? 'Loading' : 'Refresh'}
              disabled={isFetching}
              onClick={() => refresh()}
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
          <Select.Option value="recentlyCreated">
            Recently Created
          </Select.Option>
        </Select>
        <div style={{ marginTop: '8px' }}>
          <CollapseDiv>
            <Collapse>
              {filteredFunctions
                ? filteredFunctions
                    .slice(
                      (currentPage - 1) * FUNCTIONS_PER_PAGE,
                      currentPage * FUNCTIONS_PER_PAGE
                    )
                    .map(({ id, name, externalId, error }: CogFunction) => {
                      return (
                        <Panel
                          key={id}
                          header={
                            <FunctionPanelHeader
                              id={id}
                              name={name}
                              externalId={externalId}
                            />
                          }
                        >
                          <FunctionPanelContent
                            id={id}
                            name={name}
                            externalId={externalId}
                            error={error}
                          />
                        </Panel>
                      );
                    })
                : null}
            </Collapse>
            <Pagination
              current={currentPage}
              total={filteredFunctions?.length}
              defaultPageSize={FUNCTIONS_PER_PAGE}
              onChange={page => setCurrentPage(page)}
              style={{ float: 'right', marginTop: '8px' }}
            />
          </CollapseDiv>
        </div>
      </>
    );
  }
  if (activation?.status === 'requested') {
    return (
      <FunctionActivationAlert
        showIcon
        description="Cognite function is getting ready.This might take sometime"
        message="Activation in Progress"
        type="warning"
      />
    );
  }
  return (
    <FunctionActivationAlert
      type="error"
      message="Cognite Functions is not activated for the project"
      showIcon
      description={<Button onClick={() => mutate()}>Activate</Button>}
    />
  );
}

export default Functions;
