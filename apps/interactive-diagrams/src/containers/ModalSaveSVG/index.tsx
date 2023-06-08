import React, { useContext } from 'react';

import {
  CollapsibleRadio,
  Flex,
  InfoField,
} from '@interactive-diagrams-app/components/Common';
import { AppStateContext, PrefixType } from '@interactive-diagrams-app/context';
import { useConvertToSVG } from '@interactive-diagrams-app/hooks';
import { v4 as uuid } from 'uuid';

import { Body, Colors, Modal } from '@cognite/cogs.js';

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

  return (
    <Modal
      okDisabled={disabled}
      okText={`Save files (${selectedDiagrams})`}
      onCancel={onClickCancel}
      onOk={onClickOk}
      title="Save as SVG"
      visible={showModal}
    >
      <Flex column>
        {Boolean(nrOfPendingDiagramsToConvert) && (
          <InfoField style={{ marginBottom: '24px' }}>
            <Flex column>
              <Body
                level={2}
                style={{ color: Colors['decorative--blue--200'] }}
              >
                Only approved tags will be saved in the SVG.
              </Body>
            </Flex>
          </InfoField>
        )}
        <CollapsibleRadio
          groupRadioValue={prefixType}
          maxWidth={1024}
          name={uuid()}
          setGroupRadioValue={onPrefixTypeSet}
          style={{ marginBottom: '14px' }}
          title="Save with same name"
          value="original"
        >
          <Body level={2}>Save selected files with their initial names.</Body>
        </CollapsibleRadio>
        <CollapsibleRadio
          collapse={<PrefixSettings />}
          groupRadioValue={prefixType}
          maxWidth={1024}
          name={uuid()}
          setGroupRadioValue={onPrefixTypeSet}
          style={{ marginBottom: '14px' }}
          title="Specify prefix before saving"
          value="custom"
        >
          <Body level={2}>Add a prefix to names of all selected files.</Body>
        </CollapsibleRadio>
      </Flex>
    </Modal>
  );
};
