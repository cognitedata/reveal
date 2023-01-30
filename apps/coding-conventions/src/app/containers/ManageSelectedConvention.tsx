import {
  Button,
  Drawer,
  Flex,
  Input,
  SegmentedControl,
  Select,
} from '@cognite/cogs.js';
import { useState } from 'react';
import styled from 'styled-components';
import { Modal } from '../components/Modal/Modal';
import ModalFooter from '../components/Modal/ModalFooter';
import { AbbreviationTable } from '../components/Table/AbbreviationTable';
import { Convention, TagTypes } from '../pages/conventions/types';

interface Props {
  selectedConvention?: Convention;
  conventions?: Convention[];
  onChange: (item: Convention) => void;
}
export const ManageSelectedConvention: React.FC<Props> = ({
  conventions,
  selectedConvention,
  onChange,
}) => {
  const [convention, setConvention] = useState<Convention | undefined>(
    selectedConvention
  );

  const [currentKey, setCurrentKey] = useState<TagTypes>('Abbreviation');

  if (!convention) {
    return null;
  }

  const handleOnSaveClick = () => {
    onChange(convention);
  };

  return (
    <Flex gap={8} direction="column">
      {/* <Input
        placeholder="Name"
        value={convention.name}
        onChange={(e) => {
          const { value } = e.target;
          setConvention((prevState) => ({ ...prevState!, name: value }));
        }}
      /> */}

      <SegmentedControl
        currentKey={currentKey}
        onButtonClicked={(nextKey: any) => setCurrentKey(nextKey)}
      >
        <SegmentedControl.Button key="Abbreviation">
          Abbreviations
        </SegmentedControl.Button>
        <SegmentedControl.Button key="Range">Ranges</SegmentedControl.Button>
        <SegmentedControl.Button key="Regex">Regex</SegmentedControl.Button>
      </SegmentedControl>

      <AbbreviationTable convention={convention} conventions={conventions} />
    </Flex>
  );
};

const SaveButton = styled(Button)`
  width: 100px;
  display: flex;
  align-self: flex-end;
`;
