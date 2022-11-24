import React, { useContext } from 'react';
import { Modal } from 'antd';
import { Button, Body, Colors } from '@cognite/cogs.js';
import { v4 as uuid } from 'uuid';
import { AppStateContext, PrefixType } from 'context';
import { useConvertToSVG } from 'hooks';
import { CollapsibleRadio, Flex, InfoField } from 'components/Common';
import { PrefixSettings } from './PrefixSettings';

type Props = {
  diagramIds: number[];
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
};

export const ModalSaveSVG = (props: Props) => {
  const { diagramIds, showModal, setShowModal } = props;
  const { prefixType, setPrefixType } = useContext(AppStateContext);
  const { convertDiagramsToSVG, nrOfPendingDiagramsToConvert } =
    useConvertToSVG(diagramIds);

  const onPrefixTypeSet = (newPrefixType: string) => {
    setPrefixType(newPrefixType as PrefixType);
  };

  const onClickOk = () => {
    convertDiagramsToSVG();
    setShowModal(false);
  };
  const onClickCancel = () => {
    setShowModal(false);
  };

  const selectedDiagrams = diagramIds?.length ?? 0;
  const disabled = selectedDiagrams === 0;

  const footer = (
    <>
      <Button
        key="cancel"
        onClick={onClickCancel}
        type="secondary"
        variant="ghost"
      >
        Cancel
      </Button>
      <Button
        key="submit"
        onClick={onClickOk}
        type="primary"
        disabled={disabled}
      >
        Save files ({selectedDiagrams})
      </Button>
    </>
  );

  return (
    <Modal
      visible={showModal}
      onCancel={onClickCancel}
      onOk={onClickOk}
      title="Save as SVG"
      footer={[footer]}
      style={{ minWidth: '720px' }}
    >
      <Flex column>
        {Boolean(nrOfPendingDiagramsToConvert) && (
          <InfoField style={{ marginBottom: '24px' }}>
            <Flex column>
              <Body level={2} style={{ color: Colors['midblue-2'].hex() }}>
                Only approved tags will be saved in the SVG.
              </Body>
            </Flex>
          </InfoField>
        )}
        <CollapsibleRadio
          name={uuid()}
          value="original"
          title="Save with same name"
          groupRadioValue={prefixType}
          setGroupRadioValue={onPrefixTypeSet}
          maxWidth={1024}
          style={{ marginBottom: '14px' }}
        >
          <Body level={2}>Save selected files with their initial names.</Body>
        </CollapsibleRadio>
        <CollapsibleRadio
          name={uuid()}
          value="custom"
          title="Specify prefix before saving"
          groupRadioValue={prefixType}
          setGroupRadioValue={onPrefixTypeSet}
          maxWidth={1024}
          style={{ marginBottom: '14px' }}
          collapse={<PrefixSettings />}
        >
          <Body level={2}>Add a prefix to names of all selected files.</Body>
        </CollapsibleRadio>
      </Flex>
    </Modal>
  );
};
