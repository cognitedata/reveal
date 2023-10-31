import { useCallback, useEffect, useState } from 'react';

import {
  Body,
  Flex,
  InputExp,
  Modal,
  OptionType,
  Radio,
  Select,
} from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { useTranslation } from '../hooks/useTranslation';
import { ContainerReference, SerializedCanvasDocument } from '../types';

export enum AddResourcesToCanvasType {
  NEW_CANVAS = 'new-canvas',
  EXISTING_CANVAS = 'existing-canvas',
}

export type AddResourcesToCanvasOnOkArgs =
  | {
      type: AddResourcesToCanvasType.NEW_CANVAS;
      name: string;
      containerReferences: ContainerReference[];
    }
  | {
      type: AddResourcesToCanvasType.EXISTING_CANVAS;
      externalId: string;
      containerReferences: ContainerReference[];
    };

type AddResourceToCanvasModalProps = {
  containerReferences?: ContainerReference[];
  canvases?: SerializedCanvasDocument[];
  isVisible: boolean;
  onOk: (args: AddResourcesToCanvasOnOkArgs) => Promise<void>;
  onCancel: VoidFunction;
};

type SelectedCanvasOption = OptionType<string>;

export const AddResourceToCanvasModal: React.FC<
  AddResourceToCanvasModalProps
> = ({ containerReferences, canvases, isVisible, onOk, onCancel }) => {
  const { t } = useTranslation();
  const [isCallingOnOk, setIsCallingOnOk] = useState(false);

  const [checkedRadioButton, setCheckRadioButton] = useState<
    undefined | AddResourcesToCanvasType
  >(undefined);
  const [canvasName, setCanvasName] = useState<string>('');

  const [selectedCanvas, setSelectedCanvas] = useState<
    SelectedCanvasOption | undefined
  >(undefined);
  const [selectOptions, setSelectOptions] = useState<SelectedCanvasOption[]>(
    []
  );
  useEffect(() => {
    if (canvases === undefined) return;

    setSelectOptions(
      canvases.map((canvas) => ({
        label: canvas.name,
        value: canvas.externalId,
      }))
    );
  }, [canvases]);

  const isLoading =
    containerReferences === undefined ||
    containerReferences.length === 0 ||
    isCallingOnOk;
  const isLoadingCanvases = canvases === undefined || canvases.length === 0;

  const okDisabled =
    isCallingOnOk ||
    isLoading ||
    checkedRadioButton === undefined ||
    (checkedRadioButton === AddResourcesToCanvasType.NEW_CANVAS &&
      canvasName === '') ||
    (checkedRadioButton === AddResourcesToCanvasType.EXISTING_CANVAS &&
      selectedCanvas === undefined);

  const handleOnOk = useCallback(async () => {
    if (containerReferences === undefined) {
      throw new Error(
        'Container references are undefined onOk. This should not happen.'
      );
    }

    if (checkedRadioButton === AddResourcesToCanvasType.NEW_CANVAS) {
      setIsCallingOnOk(true);
      await onOk({
        type: checkedRadioButton,
        name: canvasName,
        containerReferences,
      });
      setIsCallingOnOk(false);
      return;
    }

    if (checkedRadioButton === AddResourcesToCanvasType.EXISTING_CANVAS) {
      if (selectedCanvas === undefined || selectedCanvas.value === undefined) {
        throw new Error(
          'Selected canvas is undefined or has no value onOk. This should not happen.'
        );
      }

      setIsCallingOnOk(true);
      await onOk({
        type: checkedRadioButton,
        externalId: selectedCanvas.value,
        containerReferences,
      });
      setIsCallingOnOk(false);
      return;
    }

    throw new Error(
      'Checked radio button is undefined onOk. This should not happen.'
    );
  }, [
    selectedCanvas,
    checkedRadioButton,
    canvasName,
    containerReferences,
    onOk,
  ]);

  return (
    <Modal
      visible={isVisible}
      title={t(
        translationKeys.MODAL_ADD_RESOURCE_TO_CANVAS_TITLE,
        'Add resource to canvas'
      )}
      onCancel={onCancel}
      onOk={handleOnOk}
      okDisabled={okDisabled}
      icon={isLoading ? 'Loader' : undefined}
    >
      <Body level={2}>
        <Flex direction="column" gap={8}>
          <Flex direction="column">
            <Radio
              name={AddResourcesToCanvasType.NEW_CANVAS}
              checked={
                checkedRadioButton === AddResourcesToCanvasType.NEW_CANVAS
              }
              value={AddResourcesToCanvasType.NEW_CANVAS}
              onChange={(_, value) => {
                setCheckRadioButton(
                  value as AddResourcesToCanvasType | undefined
                );
              }}
            />
            <InputExp
              label={t(translationKeys.NEW_CANVAS, 'New canvas')}
              type="text"
              fullWidth
              placeholder={t(
                translationKeys.MODAL_ADD_RESOURCE_TO_CANVAS_NEW_CANVAS_PLACEHOLDER,
                'New canvas...'
              )}
              value={canvasName}
              onChange={(e) => setCanvasName(e.target.value)}
            />
          </Flex>

          <Flex direction="column">
            <Radio
              name={AddResourcesToCanvasType.EXISTING_CANVAS}
              value={AddResourcesToCanvasType.EXISTING_CANVAS}
              checked={
                checkedRadioButton === AddResourcesToCanvasType.EXISTING_CANVAS
              }
              onChange={(_, value) =>
                setCheckRadioButton(
                  value as AddResourcesToCanvasType | undefined
                )
              }
            />
            <Select
              label={t(translationKeys.EXISTING_CANVAS, 'Existing canvas')}
              fullWidth
              icon={isLoadingCanvases ? 'Loader' : undefined}
              disabled={isLoadingCanvases}
              options={selectOptions}
              value={selectedCanvas}
              onChange={setSelectedCanvas}
              menuPortalTarget={document.body}
            />
          </Flex>
        </Flex>
      </Body>
    </Modal>
  );
};
