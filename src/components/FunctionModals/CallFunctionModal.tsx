// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, Modal, Input, Form } from 'antd';
import { Button, Icon } from '@cognite/cogs.js';
import { useMutation, useQuery } from 'react-query';

import sdk from 'sdk-singleton';
import { Function, CallResponse } from 'types';
import { callStatusTag } from 'containers/Functions/FunctionCalls';

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
  id: number;
  closeModal: () => void;
};

export default function CallFunctionModal({ id, closeModal }: Props) {
  const [inputData, setInputData] = useState('');
  const { data: fn } = useQuery<Function>(`/functions/${id}`);

  const [
    createFunctionCall,
    { data, error, isLoading, isSuccess },
  ] = useMutation<CallResponse>(({ id: number, data: any }) =>
    sdk
      .post(`/api/playground/projects/${sdk.project}/functions/${id}/call`, {
        data: data || {},
      })
      .then(response => response?.data)
  );

  const [updateInterval, setUpdateInteval] = useState<number | boolean>(1000);

  const { data: callResponse } = useQuery<CallResponse>(
    `/functions/${id}/calls/${data?.id}`,
    {
      enabled: isSuccess,
      refetchInterval: updateInterval,
    }
  );
  const callStatus = callResponse?.status;

  useEffect(() => {
    if (callStatus && callStatus !== 'Running') {
      setUpdateInteval(false);
    } else {
      setUpdateInteval(1000);
    }
  }, [callResponse, callStatus]);

  const validJSONMessage = <div style={{ color: 'green' }}>JSON is valid</div>;

  // const getResult = () => {
  //   let formattedResult = <em>No results available yet</em>;
  //   if (isLoading || calling) {
  //     formattedResult = <em>Calling...</em>;
  //   } else if (result) {
  //     const callResponse = callResponses[result.id];
  //     if (callResponse && callResponse.done) {
  //       if (callResponse.response) {
  //         formattedResult = (
  //           <pre>{JSON.stringify(callResponse.response, null, 4)}</pre>
  //         );
  //       } else {
  //         formattedResult = (
  //           <em>No response was returned from this function call</em>
  //         );
  //       }
  //     }
  //     if (result.status === 'Failed') {
  //       if (result.error) {
  //         formattedResult = (
  //           <div style={{ overflowY: 'scroll', height: '300px' }}>
  //             <p>
  //               <b>Message: </b>
  //               {result.error.message}
  //             </p>
  //             <b>Trace: </b>
  //             {/**
  //             {result?.error?.trace?.split('\n')?.map((i, index) => {
  //               return <p key={`resultErrorTrace-${index.toString()}`}>{i}</p>;
  //             })}
  //            * */}
  //           </div>
  //         );
  //       } else {
  //         formattedResult = <em>There was an error from this function call</em>;
  //       }
  //     }
  //     if (result.status === 'Timeout') {
  //       formattedResult = <p>The function call timed out </p>;
  //     }
  //   } else if (error) {
  //     formattedResult = <em>There was an error calling the function</em>;
  //   }

  //   return formattedResult;
  // };

  const getCallStatus = () => {
    let callStatus = <em>No status available yet</em>;

    if (isLoading) {
      callStatus = <em>Calling...</em>;
    } else if (data) {
      callStatus = callStatusTag(callResponse?.status);
    } else if (error) {
      callStatus = <em>There was an error calling the function</em>;
    }
    return callStatus;
  };

  const handleInputDataChange = (evt: { target: { value: string } }) => {
    setInputData(evt.target.value);
  };

  const handleCancel = e => {
    e.stopPropagation();
    setInputData('');
    closeModal();
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
    createFunctionCall({ id, data: formattedInputData });
  };

  const callButton = () => {
    if (callResponse && callResponse.status === 'Running') {
      return (
        <Button type="primary" disabled>
          Calling <Icon type="Loading" style={{ paddingLeft: '8px' }} />
        </Button>
      );
    }
    return (
      <Button
        type="primary"
        disabled={isLoading || !canParseInputData(inputData)}
        onClick={e => handleCallButtonClick(e)}
      >
        Call
      </Button>
    );
  };

  return (
    <Modal footer={null} visible width="900px" onCancel={handleCancel}>
      <Card title="Call Function" style={{ marginRight: '24px' }}>
        <div style={{ display: 'inline' }}>
          <div>
            <b>Function: </b> {fn?.name}
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
            TODO
          </div>
        </div>
      </Card>
    </Modal>
  );
}

export const stuffForUnitTests = {
  canParseInputData,
};
