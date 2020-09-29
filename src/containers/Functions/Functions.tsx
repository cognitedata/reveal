import React, { useState, useEffect } from 'react';
import { useQueryCache } from 'react-query';
import { Row, Collapse, Input, Pagination, Select } from 'antd';
import { Colors, Button, Icon } from '@cognite/cogs.js';

import styled from 'styled-components';

import { PageTitle } from '@cognite/cdf-utilities';
import { CogFunction } from 'types';

import { recentlyCreated, sortLastCall } from 'utils/sorting';
import FunctionPanelHeader from 'containers/Functions/FunctionPanelHeader';
import FunctionPanelContent from 'containers/Functions/FunctionPanelContent';
import UploadFunctionButton from 'components/buttons/UploadFunctionButton';

import { useFunctions, useMultipleCalls } from 'utils/hooks';

const CollapseDiv = styled.div`
  .ant-collapse-header[aria-expanded='true'] {
    background-color: ${Colors['midblue-6'].hex()};
  }
`;

const FUNCTIONS_PER_PAGE = 10;

function Functions() {
  const queryCache = useQueryCache();
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

  const sortedFunctions = functions?.sort(sortFn);
  const filteredFunctions = sortedFunctions?.filter((f: CogFunction) =>
    [f.name, f.externalId || '', f.owner || '']
      .join('')
      .toLowerCase()
      .includes(functionFilter.toLowerCase())
  );

  // Warm up the cache for the first page rendered
  useEffect(() => {
    if (functionsDone && filteredFunctions) {
      filteredFunctions.slice(0, FUNCTIONS_PER_PAGE).forEach(fn => {
        queryCache.setQueryData(`/functions/${fn.id}`, fn);
      });
    }
  }, [functionsDone, filteredFunctions, queryCache]);

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
            onClick={() => queryCache.invalidateQueries('/functions')}
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
            style={{ float: 'right' }}
          />
        </CollapseDiv>
      </div>
    </>
  );
}

export default Functions;
