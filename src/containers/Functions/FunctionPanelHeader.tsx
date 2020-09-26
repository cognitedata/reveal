import React from 'react';

import { Icon } from '@cognite/cogs.js';
import { Tag } from 'antd';
import { Call } from 'types';
import moment from 'moment';
import DeleteFunctionButton from 'components/DeleteFunctionButton';
import CallFunctionButton from 'components/CallFunctionButton';
import FunctionCallStatus from 'components/FunctionCallStatus';
import LastFunctionCall from 'components/LastFunctionCall';
import FunctionScheduleIndicator from 'components/FunctionScheduleIndicator';
import FunctionStatus from 'components/FunctionStatus';

type Props = {
  id: number;
  name: string;
  externalId?: string;
};

export default function FunctionPanelHeader({ id, externalId, name }: Props) {
  return (
    <div style={{ overflow: 'auto', display: 'flex', alignItems: 'center' }}>
      <span
        style={{
          width: '30%',
          float: 'left',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflowX: 'auto',
        }}
      >
        {name}
        <FunctionScheduleIndicator externalId={externalId} />
      </span>
      <span
        style={{
          width: '20%',
          float: 'left',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflowX: 'auto',
        }}
      >
        <FunctionStatus id={id} />
      </span>
      <span style={{ width: '20%', float: 'left' }}>
        <LastFunctionCall
          id={id}
          renderCall={(_: number, call: Call) => (
            <>{moment.utc(call.endTime).fromNow()}</>
          )}
        />
      </span>
      <span style={{ width: '20%', float: 'left' }}>
        <LastFunctionCall
          id={id}
          renderLoading={() => <Icon type="Loading" />}
          renderMissing={() => <Tag>Not called yet</Tag>}
          renderCall={(id: number, call: Call) => (
            <FunctionCallStatus id={id} callId={call.id} />
          )}
        />
      </span>
      <span style={{ float: 'right', marginTop: '4px', marginRight: '4px' }}>
        <CallFunctionButton id={id} />
        <DeleteFunctionButton id={id} />
      </span>
    </div>
  );
}
