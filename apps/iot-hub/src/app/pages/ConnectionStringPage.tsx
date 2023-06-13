import { useState } from 'react';

import noop from 'lodash/noop';

import { Divider, Flex, Input, Modal, Overline } from '@cognite/cogs.js';

import { IoTParams, useIoT } from '../context/IoTHubContext';

export const ConnectionStringModal = ({
  visible,
  onClose = noop,
}: {
  visible: boolean;
  onClose?: () => void;
}) => {
  const { setIotParams, iotParams } = useIoT();

  const [localIotParams, setLocalIotParams] = useState(iotParams);

  return (
    <Modal
      visible={visible}
      title="Configure IoT Hub connection"
      size="medium"
      onOk={() => {
        setIotParams(localIotParams);
        onClose();
      }}
      onCancel={onClose}
    >
      <Flex direction="column" gap={16}>
        <Flex direction="column" gap={4}>
          <Overline>Connection String</Overline>
          <Input
            fullWidth
            placeholder="Enter connection string from Azure"
            onChange={(ev) => {
              setLocalIotParams(() =>
                ev.target.value.split(';').reduce(
                  (prev, item) => {
                    const [key, value] = item.split('=');
                    switch (key) {
                      case 'HostName':
                        prev['resourceUri'] = value;
                        break;
                      case 'SharedAccessKeyName':
                        prev['policyName'] = value;
                        break;
                      case 'SharedAccessKey':
                        prev['signingKey'] = value;
                        break;
                    }
                    return prev;
                  },
                  { ...localIotParams } as IoTParams
                )
              );
            }}
            value={`HostName=${localIotParams.resourceUri};SharedAccessKeyName=${localIotParams.policyName};SharedAccessKey=${localIotParams.signingKey}`}
          />
        </Flex>
        <Divider direction="horizontal" />
        <Flex direction="column" gap={4}>
          <Overline>Resource URI / Host name</Overline>
          <Input
            fullWidth
            placeholder="Enter resource URI from Azure"
            value={localIotParams.resourceUri}
            onChange={(ev) => {
              setLocalIotParams((prev) => ({
                ...prev,
                resourceUri: ev.target.value,
              }));
            }}
          />
        </Flex>
        <Flex direction="column" gap={4}>
          <Overline>Policy name / Shared access key name</Overline>
          <Input
            fullWidth
            placeholder="Enter policy name from Azure"
            value={localIotParams.policyName}
            onChange={(ev) => {
              setLocalIotParams((prev) => ({
                ...prev,
                policyName: ev.target.value,
              }));
            }}
          />
        </Flex>
        <Flex direction="column" gap={4}>
          <Overline>Signing key / Shared access key</Overline>
          <Input
            fullWidth
            placeholder="Enter signing key from Azure"
            value={localIotParams.signingKey}
            onChange={(ev) => {
              setLocalIotParams((prev) => ({
                ...prev,
                signingKey: ev.target.value,
              }));
            }}
          />
        </Flex>
      </Flex>
    </Modal>
  );
};

export const ConnectionStringPage = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <ConnectionStringModal
      visible={isVisible}
      onClose={() => setIsVisible(false)}
    />
  );
};
