import React from 'react';

import styled from 'styled-components';

import { Tag, Row, Col } from 'antd';
import moment from 'moment';

import { Icon } from '@cognite/cogs.js';

import CallFunctionButton from '../../components/buttons/CallFunctionButton';
import DeleteFunctionButton from '../../components/buttons/DeleteFunctionButton';
import FunctionCallStatus from '../../components/FunctionCallStatus';
import FunctionScheduleIndicator from '../../components/FunctionScheduleIndicator';
import FunctionStatus from '../../components/FunctionStatus';
import LastFunctionCall from '../../components/LastFunctionCall';
import { Call } from '../../types';

type Props = {
  id: number;
  name: string;
};

const PullRight = styled('div')`
  float: right;
`;
const Center = styled('div')`
  text-align: center;
`;

export default function FunctionPanelHeader({ id, name }: Props) {
  return (
    <Row justify="space-between" align="middle">
      <Col span={14}>
        {name}
        <FunctionScheduleIndicator id={id} />
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
            renderLoading={() => <Icon type="Loader" />}
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
