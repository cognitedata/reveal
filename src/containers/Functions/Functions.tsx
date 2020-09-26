import React, { useState, useEffect } from 'react';
import { useQuery, useQueryCache } from 'react-query';
import { Row, Collapse, Input, Pagination, Select } from 'antd';
import { Colors, Button, Icon } from '@cognite/cogs.js';

import styled from 'styled-components';

import { PageTitle } from '@cognite/cdf-utilities';
import { CogFunction, Call } from 'types';
import { getCalls } from 'utils/api';
import { recentlyCreated, sortLastCall } from 'utils/sorting';
import FunctionPanelHeader from 'containers/Functions/FunctionPanelHeader';
import FunctionPanelContent from 'containers/Functions/FunctionPanelContent';
import UploadFunctionButton from 'components/UploadFunctionButton';

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

  const { data, isFetching, isFetched: functionsDone } = useQuery<{
    items: CogFunction[];
  }>('/functions');
  const functions = data?.items;

  const { data: calls, isFetched: callsDone } = useQuery<{
    [id: number]: Call[];
  }>(
    [
      `/functions/calls`,
      functions
        ?.sort(({ id: id1 }, { id: id2 }) => id1 - id2)
        .map(({ id }) => ({ id })),
    ],
    getCalls,
    { enabled: functionsDone }
  );

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

  useEffect(() => {
    if (callsDone && calls) {
      Object.entries(calls)
        .filter(
          ([id]) =>
            filteredFunctions?.findIndex(f => f.id.toString() === id) !== -1
        )
        .slice(0, FUNCTIONS_PER_PAGE)
        .forEach(([id, calls]) => {
          queryCache.setQueryData([`/functions/calls`, { id }], calls);
          if (calls.length > 0) {
            const latestCall = calls[0];
            queryCache.setQueryData(
              [`/functions/calls`, { id, callId: latestCall.id }],
              latestCall
            );
          }
        });
    }
  }, [callsDone, calls, queryCache, filteredFunctions]);

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
