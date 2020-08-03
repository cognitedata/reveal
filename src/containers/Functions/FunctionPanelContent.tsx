import React, { useState } from 'react';
import { Descriptions, Tabs, Table, Tag, message, Modal, List } from 'antd';
import { Popover } from 'components/Common';
import { Button, Tooltip } from '@cognite/cogs.js';
import { Function, Call } from 'types';
import moment from 'moment';
import {
  deleteSchedule,
  selectDeleteScheduleState,
  selectScheduleAndCalls,
  ScheduleWithCalls,
} from 'modules/schedules';
import { selectFunctionCalls, retrieveLogs } from 'modules/functionCalls';
import { useSelector, useDispatch } from 'react-redux';
import { CSSProperties } from 'styled-components';
import ViewLogsModal from 'components/FunctionModals/ViewLogsModal';
import CreateScheduleModal from 'components/FunctionModals/CreateScheduleModal';
import cronstrue from 'cronstrue';
import ViewResponseModal from 'components/FunctionModals/ViewResponseModal';

type Props = {
  currentFunction: Function;
};

export const callStatusTag = (status: string, style?: CSSProperties) => {
  switch (status) {
    case 'Running':
      return (
        <Tag color="blue" style={style}>
          Running
        </Tag>
      );
    case 'Completed':
      return (
        <Tag color="green" style={style}>
          Completed
        </Tag>
      );
    case 'Failed':
      return (
        <Tag color="red" style={style}>
          Failed
        </Tag>
      );
    case 'Timeout':
      return (
        <Tag color="red" style={style}>
          Timeout
        </Tag>
      );
    default:
      return (
        <Tag color="orange" style={style}>
          {status}
        </Tag>
      );
  }
};

export default function FunctionPanelContent(props: Props) {
  const { currentFunction } = props;
  const { externalId, status: functionStatus } = currentFunction;
  const dispatch = useDispatch();
  const [showLogs, setShowLogs] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
  const [currentCall, setCurrentCall] = useState({} as Call);
  const notSet = <em>Not Set</em>;
  const { functionCalls, error: errorGettingFunctionCalls } = useSelector(
    selectFunctionCalls(currentFunction.id)
  );
  const scheduleAndCalls =
    useSelector(selectScheduleAndCalls(currentFunction.externalId)) || [];

  const {
    scheduleToDelete,
    deleting,
    error: errorInDeletingSchedule,
  } = useSelector(selectDeleteScheduleState);

  const handleViewResponse = (call: Call) => {
    setShowResponse(true);
    setCurrentCall(call);
  };
  const closeResponse = () => {
    setCurrentCall({} as Call);
    setShowResponse(false);
  };

  const handleViewLogs = (call: Call) => {
    dispatch(retrieveLogs(currentFunction.id, call.id));
    setShowLogs(true);
    setCurrentCall(call);
  };
  const closeLogs = () => {
    setCurrentCall({} as Call);
    setShowLogs(false);
  };
  const callTableColumns = [
    {
      title: 'Call Time',
      key: 'Call Time',
      render: (call: Call) => {
        const startTime = moment.utc(call.startTime);
        const timeSince = moment(startTime).fromNow();
        return timeSince;
      },
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (call: Call) => {
        // If the function isn't finished yet, show current duration with end time being now
        const endTime = moment.utc(call.endTime) || moment.utc(new Date());
        const startTime = moment.utc(call.startTime);

        // round up to the nearest second
        const duration = moment
          .utc(endTime.diff(startTime))
          .add(1, 'second')
          .startOf('second');
        return `${duration.format('mm:ss')} m`;
      },
    },
    {
      title: 'Call Status',
      key: 'callStatus',
      render: (call: Call) => {
        return callStatusTag(call.status);
      },
    },
    {
      title: 'Response',
      key: 'response',
      render: (call: Call) => {
        if (!call.error && call.status === 'Completed') {
          return (
            <Button onClick={() => handleViewResponse(call)}>
              View Response
            </Button>
          );
        }
        return null;
      },
    },
    {
      title: 'Logs',
      key: 'logs',
      render: (call: Call) => (
        <Button onClick={() => handleViewLogs(call)}>View Logs</Button>
      ),
    },
  ];

  const callTable = (
    <Table
      rowKey={call => call.id.toString()}
      pagination={{ pageSize: 25 }}
      dataSource={functionCalls}
      columns={callTableColumns}
    />
  );

  const functionDetails = (
    <Descriptions>
      <Descriptions.Item label="Description" span={3}>
        {currentFunction.description || notSet}
      </Descriptions.Item>
      <Descriptions.Item label="Created by" span={3}>
        {currentFunction.owner || notSet}
      </Descriptions.Item>
      <Descriptions.Item label="Date Created" span={3}>
        {moment.utc(currentFunction.createdTime).format('LLL')}
      </Descriptions.Item>
      <Descriptions.Item label="API Key" span={3}>
        {currentFunction.apiKey || notSet}
      </Descriptions.Item>
      <Descriptions.Item label="Function Id" span={3}>
        {currentFunction.id}
      </Descriptions.Item>
      <Descriptions.Item label="File Id" span={3}>
        {currentFunction.fileId}
      </Descriptions.Item>
      <Descriptions.Item label="External Id" span={3}>
        {currentFunction.externalId || notSet}
      </Descriptions.Item>
      <Descriptions.Item label="Secrets" span={3}>
        <div style={{ display: 'flex' }}>
          <pre>{JSON.stringify(currentFunction.secrets, null, 4)}</pre>
        </div>
      </Descriptions.Item>
    </Descriptions>
  );

  const scheduleTableColumns = [
    {
      title: 'Schedule Info',
      key: 'scheduleInfo',
      render: (s: ScheduleWithCalls) => {
        return (
          <List.Item>
            <List.Item.Meta
              title={s.schedule.name}
              description={s.schedule.description}
            />
          </List.Item>
        );
      },
    },
    {
      title: 'Cron Expression',
      key: 'cronExpression',
      render: (s: any) => {
        return s.schedule.cronExpression;
      },
    },
    {
      title: 'Occurs',
      key: 'cronExpressionDescription',
      render: (s: ScheduleWithCalls) => {
        return cronstrue.toString(s.schedule.cronExpression);
      },
    },
    {
      title: 'Created Time',
      key: 'createdTime',
      render: (s: ScheduleWithCalls) => {
        return moment(s.schedule.createdTime).format('MM-DD-YYYY HH:mm');
      },
    },
    {
      title: 'Input Data',
      key: 'inputData',
      render: (s: ScheduleWithCalls) => {
        if (Object.keys(s.schedule.data || {}).length !== 0) {
          const dataDisplay = (
            <pre>{JSON.stringify(s.schedule.data, null, 2)}</pre>
          );
          return (
            <Popover content={dataDisplay}>
              <Button type="link">View Input Data</Button>
            </Popover>
          );
        }
        return null;
      },
    },
    {
      title: 'Delete',
      key: 'deleteSchedule',
      render: (s: ScheduleWithCalls) => {
        if (
          errorInDeletingSchedule &&
          scheduleToDelete &&
          s.schedule.id === scheduleToDelete.id
        ) {
          message.error('Unable to delete schedule');
        }

        if (
          deleting &&
          scheduleToDelete &&
          s.schedule.id === scheduleToDelete.id
        ) {
          return <Button icon="Loading">Delete</Button>;
        }
        return (
          <Button
            icon="Delete"
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure?',
                content: 'Are you sure you want to delete this schedule?',
                onOk: () => {
                  dispatch(deleteSchedule(s.schedule));
                },
                onCancel: () => {},
                okText: 'Delete',
              });
            }}
          />
        );
      },
    },
  ];

  const scheduleTable = (
    <Table
      rowKey={s => s.schedule.id.toString()}
      pagination={{ pageSize: 25 }}
      dataSource={scheduleAndCalls.sort((a: any, b: any) => {
        if (a.schedule.createdTime > b.schedule.createdTime) {
          return -1;
        }
        if (a.schedule.createdTime < b.schedule.createdTime) {
          return 1;
        }
        return 0;
      })}
      columns={scheduleTableColumns}
      expandedRowRender={s => {
        return (
          <Table
            rowKey={(call: Call) => call.id.toString()}
            pagination={{ pageSize: 5 }}
            dataSource={s.calls}
            columns={callTableColumns}
          />
        );
      }}
    />
  );

  const createScheduleButton = () => {
    if (!externalId || functionStatus !== 'Ready') {
      return (
        <>
          <Tooltip
            placement="right"
            content="The function must have an external id to create a schedule"
          >
            <Button
              type="primary"
              disabled
              style={{ marginBottom: '4px', marginLeft: '4px' }}
            >
              Create Schedule
            </Button>
          </Tooltip>
        </>
      );
    }
    return (
      <Button
        type="primary"
        onClick={() => setShowCreateScheduleModal(true)}
        style={{ marginBottom: '4px', marginLeft: '4px' }}
      >
        Create Schedule
      </Button>
    );
  };

  return (
    <Tabs>
      {currentFunction.error ? (
        <Tabs.TabPane tab="Error Info" key="error">
          <div style={{ overflowY: 'scroll', height: '300px' }}>
            <p>
              <b>Message: </b>
              {currentFunction.error.message}
            </p>
            <b>Trace: </b>
            {currentFunction.error.trace.split('\n').map((i, index) => {
              return <p key={`functionErrortrace-${index.toString()}`}>{i}</p>;
            })}
          </div>
        </Tabs.TabPane>
      ) : undefined}
      <Tabs.TabPane tab="Calls" key="calls">
        {errorGettingFunctionCalls ? 'Unable to retrieve calls' : callTable}
        {showLogs && currentCall ? (
          <ViewLogsModal
            visible
            functionId={currentFunction.id}
            call={currentCall}
            onCancel={closeLogs}
          />
        ) : null}
        {showResponse && currentCall ? (
          <ViewResponseModal
            visible
            call={currentCall}
            onCancel={closeResponse}
            currentFunction={currentFunction}
          />
        ) : null}
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={`Schedules (${scheduleAndCalls.length})`}
        key="schedules"
      >
        {createScheduleButton()}
        {scheduleTable}
        <CreateScheduleModal
          visible={showCreateScheduleModal}
          onCancel={() => setShowCreateScheduleModal(false)}
          functionExternalId={currentFunction.externalId}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Details" key="details">
        {functionDetails}
      </Tabs.TabPane>
    </Tabs>
  );
}
