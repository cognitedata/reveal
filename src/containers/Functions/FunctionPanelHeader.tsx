import React from 'react';
import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';
import { Tag, Row, Col } from 'antd';
import { Call } from 'types';
import moment from 'moment';
import DeleteFunctionButton from 'components/buttons/DeleteFunctionButton';
import CallFunctionButton from 'components/buttons/CallFunctionButton';
import FunctionCallStatus from 'components/FunctionCallStatus';
import LastFunctionCall from 'components/LastFunctionCall';
import FunctionScheduleIndicator from 'components/FunctionScheduleIndicator';
import FunctionStatus from 'components/FunctionStatus';

type Props = {
  id: number;
  name: string;
  externalId?: string;
};

const PullRight = styled('div')`
  float: right;
`;
const Center = styled('div')`
  text-align: center;
`;

export default function FunctionPanelHeader({ id, externalId, name }: Props) {
  return (
    <Row type="flex" justify="space-between">
      <Col span={14}>
        {name}
        <FunctionScheduleIndicator externalId={externalId} />
      </Col>
      <Col span={2}>
        <Center>
          <FunctionStatus id={id} />
        </Center>
      </Col>
      <Col span={4}>
        <Center>
          <LastFunctionCall
            id={id}
            renderCall={(_: number, call: Call) => (
              <>{moment.utc(call.endTime).fromNow()}</>
            )}
          />
        </Center>
      </Col>
      <Col span={2}>
        <PullRight>
          <LastFunctionCall
            id={id}
            renderLoading={() => <Icon type="Loading" />}
            renderMissing={() => <Tag>Not called yet</Tag>}
            renderCall={(functionId: number, call: Call) => (
              <FunctionCallStatus id={functionId} callId={call.id} />
            )}
          />
        </PullRight>
      </Col>
      <Col span={2}>
        <PullRight>
          <CallFunctionButton id={id} />
          <DeleteFunctionButton id={id} />
        </PullRight>
      </Col>
    </Row>
  );
}
