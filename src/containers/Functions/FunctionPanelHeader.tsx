import React from 'react';
import { Tag, Modal, message, Icon } from 'antd';
import { Button, Tooltip } from '@cognite/cogs.js';
import { deleteFunction, selectDeleteFunctionState } from 'modules/delete';
import { selectFunctionCalls } from 'modules/functionCalls';
import { storeFunctionToCall } from 'modules/call';
import { useDispatch, useSelector } from 'react-redux';
import { Function, Call } from 'types';
import moment from 'moment';
import { callStatusTag } from 'containers/Functions/FunctionPanelContent';
import { selectFunctionSchedules } from 'modules/schedules';

type Props = {
  currentFunction: Function;
};

export default function FunctionPanelHeader(props: Props) {
  const { currentFunction } = props;
  const dispatch = useDispatch();
  const calls = useSelector(selectFunctionCalls(currentFunction.id))
    .functionCalls;
  const {
    functionToDelete,
    deleting,
    error: errorInDeletingFunction,
  } = useSelector(selectDeleteFunctionState);
  const schedules = useSelector(
    selectFunctionSchedules(currentFunction.externalId)
  );

  const deletingFunction =
    deleting && functionToDelete && currentFunction.id === functionToDelete.id;

  const functionStatusTag = (status: string) => {
    let color;
    switch (status) {
      case 'Ready':
        color = 'green';
        break;
      case 'Queued':
        color = 'blue';
        break;
      case 'Deploying':
        color = 'blue';
        break;
      case 'Failed':
        color = 'red';
        break;
      default:
        color = 'pink';
        break;
    }

    return (
      <Tag color={color} style={{ marginLeft: '8px' }}>
        {status}
      </Tag>
    );
  };
  const mostRecentCall = calls && calls.length > 0 ? calls[0] : undefined;

  const deleteFunctionButton = deletingFunction ? (
    <Button
      icon="Loading"
      size="small"
      style={{
        marginLeft: '8px',
        justifyContent: 'center',
      }}
    />
  ) : (
    <Button
      icon="Delete"
      size="small"
      style={{
        marginLeft: '8px',
        justifyContent: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        Modal.confirm({
          title: 'Are you sure?',
          content: 'Are you sure you want to delete this function?',
          onOk: () => {
            dispatch(deleteFunction(currentFunction));
          },
          onCancel: () => {},
          okText: 'Delete',
        });
      }}
    />
  );

  const runFunctionButton = (
    <Tooltip placement="top" content="Click to call the function">
      <Button
        icon="TriangleRight"
        size="small"
        style={{
          justifyContent: 'center',
        }}
        disabled={currentFunction.status !== 'Ready'}
        onClick={e => {
          e.stopPropagation();
          dispatch(storeFunctionToCall(currentFunction));
        }}
      />
    </Tooltip>
  );

  const lastCallDuration = (call: Call) => {
    return moment.utc(call.endTime).fromNow();
  };

  const lastCallStatus = (call: Call) => {
    return callStatusTag(call.status, {
      marginLeft: '8px',
    });
  };

  React.useEffect(() => {
    if (functionToDelete && errorInDeletingFunction) {
      message.error(`Unable to delete ${functionToDelete.name}`);
    }
  }, [errorInDeletingFunction, functionToDelete]);

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
        {currentFunction.name}
        {schedules.length > 0 ? (
          <Tooltip
            placement="top"
            content={`Has ${schedules.length} schedules`}
          >
            <Icon
              type="clock-circle"
              theme="twoTone"
              style={{ marginLeft: '8px' }}
            />
          </Tooltip>
        ) : undefined}
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
        {functionStatusTag(currentFunction.status)}
      </span>
      <span style={{ width: '20%', float: 'left' }}>
        {mostRecentCall ? (
          <>Last Call: {lastCallDuration(mostRecentCall)}</>
        ) : (
          <>
            Last Call: <em>No calls yet</em>
          </>
        )}
      </span>
      <span style={{ width: '20%', float: 'left' }}>
        {mostRecentCall ? <>{lastCallStatus(mostRecentCall)}</> : null}
      </span>
      <span style={{ float: 'right', marginTop: '4px', marginRight: '4px' }}>
        {runFunctionButton}
        {deleteFunctionButton}
      </span>
    </div>
  );
}
