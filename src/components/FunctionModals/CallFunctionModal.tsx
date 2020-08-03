import React, { useState } from 'react';
import { Card, Modal, Input, Form } from 'antd';
import { Button, Icon } from '@cognite/cogs.js';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCallInfo,
  callFunction,
  selectFunctionToCall,
  callFunctionReset,
} from 'modules/call';
import { callStatusTag } from 'containers/Functions/FunctionPanelContent';
import { responsesSelector } from 'modules/response';

const canParseInputData = (inputData: string) => {
  if (inputData === '') {
    return true;
  }
  try {
    JSON.parse(inputData);
    return (
      typeof JSON.parse(inputData) === 'object' &&
      !Array.isArray(JSON.parse(inputData))
    );
  } catch {
    return false;
  }
};

type Props = {
  visible: boolean;
};

export default function CallFunctionModal(props: Props) {
  const { visible } = props;
  const functionToCall = useSelector(selectFunctionToCall);
  const { result, creating, calling, error } = useSelector(selectCallInfo);
  const callResponses = useSelector(responsesSelector)(
    functionToCall?.externalId
  );
  const [inputData, setInputData] = useState('');
  const dispatch = useDispatch();

  const validJSONMessage = <div style={{ color: 'green' }}>JSON is valid</div>;

  const getResult = () => {
    let formattedResult = <em>No results available yet</em>;
    if (creating || calling) {
      formattedResult = <em>Calling...</em>;
    } else if (result) {
      const callResponse = callResponses[result.id];
      if (callResponse && callResponse.done) {
        if (callResponse.response) {
          formattedResult = (
            <pre>{JSON.stringify(callResponse.response, null, 4)}</pre>
          );
        } else {
          formattedResult = (
            <em>No response was returned from this function call</em>
          );
        }
      }
      if (result.status === 'Failed') {
        if (result.error) {
          formattedResult = (
            <div style={{ overflowY: 'scroll', height: '300px' }}>
              <p>
                <b>Message: </b>
                {result.error.message}
              </p>
              <b>Trace: </b>
              {result.error.trace.split('\n').map((i, index) => {
                return <p key={`resultErrorTrace-${index.toString()}`}>{i}</p>;
              })}
            </div>
          );
        } else {
          formattedResult = <em>There was an error from this function call</em>;
        }
      }
      if (result.status === 'Timeout') {
        formattedResult = <p>The function call timed out </p>;
      }
    } else if (error) {
      formattedResult = <em>There was an error calling the function</em>;
    }

    return formattedResult;
  };

  const getCallStatus = () => {
    let callStatus = <em>No status available yet</em>;
    if (creating) {
      callStatus = <em>Calling...</em>;
    } else if (result) {
      callStatus = callStatusTag(result.status);
    } else if (error) {
      callStatus = <em>There was an error calling the function</em>;
    }
    return callStatus;
  };

  const handleInputDataChange = (evt: { target: { value: string } }) => {
    setInputData(evt.target.value);
  };

  const handleCancel = () => {
    dispatch(callFunctionReset());
    setInputData('');
  };

  const inputDataField = (
    <Form.Item
      validateStatus={canParseInputData(inputData) ? 'success' : 'error'}
      help={
        !canParseInputData(inputData)
          ? 'Input data must be a valid JSON object'
          : validJSONMessage
      }
      hasFeedback
    >
      <Input.TextArea
        rows={4}
        value={inputData}
        onChange={handleInputDataChange}
        allowClear
        style={{ marginTop: '8px' }}
      />
    </Form.Item>
  );

  const handleCallButtonClick = (e: any) => {
    e.stopPropagation();
    const formattedInputData =
      inputData === '' ? undefined : JSON.parse(inputData);
    if (functionToCall) {
      dispatch(callFunction(functionToCall, formattedInputData));
    }
  };

  const callButton = () => {
    if (result && result.status === 'Running') {
      return (
        <Button type="primary" disabled>
          Calling <Icon type="Loading" style={{ paddingLeft: '8px' }} />
        </Button>
      );
    }
    return (
      <Button
        type="primary"
        disabled={creating || !canParseInputData(inputData)}
        onClick={e => handleCallButtonClick(e)}
      >
        Call
      </Button>
    );
  };

  return (
    <Modal
      visible={visible}
      footer={null}
      width="900px"
      onCancel={handleCancel}
    >
      <Card title="Call Function" style={{ marginRight: '24px' }}>
        <div style={{ display: 'inline' }}>
          <div>
            <b>Function: </b> {functionToCall?.name}
          </div>
          <>
            <b>Input data:</b>
            {inputDataField}
          </>
          <>{callButton()}</>
        </div>
        <div style={{ marginTop: '32px' }}>
          <>
            <b>Call Status: </b>
            {getCallStatus()}
          </>
          <div>
            <b>Result: </b>
            {getResult()}
          </div>
        </div>
      </Card>
    </Modal>
  );
}

export const stuffForUnitTests = {
  canParseInputData,
};
