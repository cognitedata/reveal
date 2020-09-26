import React from 'react';
import { Tabs } from 'antd';

import FunctionDetails from './FunctionDetails';
import FunctionCalls from './FunctionCalls';
import FunctionSchedules from './FunctionSchedules';
import FunctionErrors from './FunctionErrors';

type Props = {
  id: number;
  name: string;
  externalId?: string;
  error?: any;
};

export default function FunctionPanelContent({
  id,
  externalId,
  name,
  error,
}: Props) {
  return (
    <Tabs>
      {error ? (
        <Tabs.TabPane tab="Error Info" key="error">
          <FunctionErrors error={error} />
        </Tabs.TabPane>
      ) : null}
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
