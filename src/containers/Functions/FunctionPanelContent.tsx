import React from 'react';
import { Tabs } from 'antd';

import { Function } from 'types';

import FunctionDetails from './FunctionDetails';
import FunctionCalls from './FunctionCalls';
import FunctionSchedules from './FunctionSchedules';

type Props = {
  currentFunction: Function;
};

export default function FunctionPanelContent(props: Props) {
  const { currentFunction } = props;
  const { externalId, error, id, name } = currentFunction;

  return (
    <Tabs>
      {error ? (
        <Tabs.TabPane tab="Error Info" key="error">
          <div style={{ overflowY: 'scroll', height: '300px' }}>
            <p>
              <b>Message: </b>
              {error.message}
            </p>
            <b>Trace: </b>
            {error.trace.split('\n').map((i, index) => {
              return <p key={`functionErrortrace-${index.toString()}`}>{i}</p>;
            })}
          </div>
        </Tabs.TabPane>
      ) : undefined}
      <Tabs.TabPane tab="Calls" key="calls">
        <FunctionCalls id={id} name={name} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Schedules" key="schedules">
        <FunctionSchedules externalId={externalId} id={id} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Details" key="details">
        <FunctionDetails id={id} name={name} />
      </Tabs.TabPane>
    </Tabs>
  );
}
