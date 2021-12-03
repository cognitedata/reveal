import styled from 'styled-components/macro';
import {
  Button,
  Icon,
  Menu,
  SegmentedControl,
  Title,
  Tooltip,
} from '@cognite/cogs.js';
import { useState, useEffect } from 'react';

type AutoAlignDropdownProps = {
  initialValue?: boolean;
  saveAutoAlign: (autoAlign: boolean) => void;
};

const AutoAlignDropdown = ({
  initialValue = false,
  saveAutoAlign,
}: AutoAlignDropdownProps) => {
  const [autoAlign, setAutoAlign] = useState(initialValue);

  useEffect(() => {
    setAutoAlign(initialValue);
  }, [initialValue]);

  return (
    <Menu style={{ marginBottom: 10 }}>
      <DropdownContainer>
        <ATitleWrapper>
          <Title level={6}>Automatic data alignment</Title>
          <Tooltip content="Automatically align time stamp of input time series">
            <Icon type="Info" />
          </Tooltip>
        </ATitleWrapper>

        <FormWrapper>
          <SegmentedControl
            currentKey={autoAlign ? 'on' : 'off'}
            onButtonClicked={(key: string) => setAutoAlign(key === 'on')}
          >
            <SegmentedControl.Button key="on">On</SegmentedControl.Button>
            <SegmentedControl.Button key="off">Off</SegmentedControl.Button>
          </SegmentedControl>
          <Button type="primary" onClick={() => saveAutoAlign(autoAlign)}>
            Confirm
          </Button>
        </FormWrapper>
      </DropdownContainer>
    </Menu>
  );
};

const DropdownContainer = styled.div`
  width: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
`;

const ATitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default AutoAlignDropdown;
