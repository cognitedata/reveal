import React from 'react';
import { Tabs } from 'antd';

import FunctionDetails from 'components/FunctionDetails';
import FunctionCalls from 'components/FunctionCalls';
import FunctionSchedules from 'components/FunctionSchedules';
import FunctionErrors from 'components/FunctionErrors';

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
