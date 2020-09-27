// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal, Input, Form } from 'antd';
import { Button, Icon } from '@cognite/cogs.js';
import { useMutation, useQuery, useQueryCache } from 'react-query';

import { CogFunction, CallResponse } from 'types';
import { callFunction, getCall } from 'utils/api';
import FunctionCallStatus from 'components/FunctionCallStatus';
import FunctionCallResponse from 'components/FunctionCallResponse';

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
  const queryCache = useQueryCache();
  const [inputData, setInputData] = useState('');
  const { data: fn } = useQuery<CogFunction>(`/functions/${id}`);

  const [
    createFunctionCall,
    { data, isLoading, isSuccess }, // TODO: error handling
  ] = useMutation<CallResponse>(callFunction, {
    onSuccess() {
      // TODO: excact: true shouldn't be needed?
      queryCache.invalidateQueries(['/functions/calls', { id }], {
        exact: true,
      });
    },
  });

  const [updateInterval, setUpdateInteval] = useState<number | boolean>(1000);
  const { data: callResponse } = useQuery<CallResponse>(
    ['/functions/calls', { id, callId: data?.id }],
    getCall,
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
    <Modal
    title="Call function"
    visible
    width={900}
    onCancel={handleCancel}
      >

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
            <FunctionCallStatus id={id} callId={data?.id} />
          </>
          <div>
            <b>Result: </b>
            <FunctionCallResponse id={id} callId={data?.id} />
          </div>
        </div>

    </Modal>
  );
}

export const stuffForUnitTests = {
  canParseInputData,
};
