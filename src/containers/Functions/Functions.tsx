import React, { useState, useEffect } from 'react';
import { useQuery, useQueryCache } from 'react-query';
import { Row, Collapse, Input, Pagination, Select } from 'antd';
import { Colors, Button, Icon } from '@cognite/cogs.js';

import styled from 'styled-components';

import { PageTitle } from '@cognite/cdf-utilities';
import { Function } from 'types';
import { getCalls } from 'utils/api';
import { recentlyCreated, sortLastCall } from 'utils/sorting';
import FunctionPanelHeader from 'containers/Functions/FunctionPanelHeader';
import FunctionPanelContent from 'containers/Functions/FunctionPanelContent';

const CollapseDiv = styled.div`
  .ant-collapse-header[aria-expanded='true'] {
    background-color: ${Colors['midblue-6'].hex()};
  }
`;

function Functions() {
  const queryCache = useQueryCache();
  const [callsDone, setCallsDone] = useState(false);

  const { data, isFetching } = useQuery<{ items: Function[] }>('/functions');
  const functions = data?.items;

  useEffect(() => {
    if (functions) {
      Promise.all(
        functions.map(({ id }) =>
          queryCache.prefetchQuery([`/functions/calls`, { id }], getCalls)
        )
      ).then(() => {
        setCallsDone(true);
      });
    }
  }, [queryCache, functions]);

  const [currentPage, setCurrentPage] = useState(1);

  const [functionFilter, setFunctionFilter] = useState('');
  type SortFunctions = 'recentlyCreated' | 'recentlyCalled';
  const [sortFunctionCriteria, setSortFunctionCriteria] = useState<
    SortFunctions
  >('recentlyCalled');
  const FUNCTIONS_PER_PAGE = 10;
  const { Panel } = Collapse;

  const sortFn =
    sortFunctionCriteria === 'recentlyCalled' && callsDone
      ? sortLastCall(queryCache)
      : recentlyCreated;

  const sortedFunctions = functions?.sort(sortFn);

  const filteredFunctions = sortedFunctions?.filter((f: Function) =>
    [f.name, f.externalId || '', f.owner || '']
      .join('')
      .toLowerCase()
      .includes(functionFilter.toLowerCase())
  );

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
          <Button
            icon="Upload"
            type="primary"
            onClick={() => {
              // setShowUploadModal(true)
            }}
          >
            Upload function
          </Button>
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
                  .map((currentFunction: Function) => {
                    return (
                      <Panel
                        key={currentFunction.id}
                        header={
                          <FunctionPanelHeader
                            currentFunction={currentFunction}
                          />
                        }
                      >
                        <FunctionPanelContent
                          currentFunction={currentFunction}
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
        {/** <CallFunctionModal visible={!!functionToRun} />
        <UploadFunctionModal
          visible={showUploadModal}
          onCancel={() => setShowUploadModal(false)}
        />
* */}
      </div>
    </>
  );
}

export default Functions;
