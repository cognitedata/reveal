import React, { forwardRef, useState } from 'react';
import { CogniteCapability, SingleCogniteCapability } from '@cognite/sdk';
import { Button } from '@cognite/cogs.js';

import CapabilitiesList from './CapabilitiesList';
import SingleCapabilityEditor from './SingleCapabilityEditor';
import { isDeprecated } from './utils';
import { useTranslation } from 'common/i18n';

interface CapabilitiesSelectorProps {
  value: CogniteCapability;
  onChange(value: CogniteCapability): void;
}

const CapabilitiesSelector = (props: CapabilitiesSelectorProps, ref: any) => {
  const { onChange, value } = props;
  const { t } = useTranslation();

  const [capabilities, setCapabilities] = useState<CogniteCapability>(
    value.filter(isDeprecated)
  );
  const [composerVisible, setComposerVisible] = useState<boolean>(false);
  const [editCapabilityIndex, setEditCapabilityIndex] = useState<number>(-1);

  /*
    Ref used to automatically scroll the form so the add capability button is
    visible again after adding one.
  */
  let bottomElementRef: HTMLDivElement | null;

  const scrollToBottom = () => {
    if (bottomElementRef) {
      bottomElementRef.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToBottomElement = (
    <div
      ref={(element) => {
        bottomElementRef = element;
      }}
    />
  );

  const triggerChange = (newValue: CogniteCapability) => {
    onChange(newValue);
  };

  const openCapabilityComposer = () => setComposerVisible(true);

  const closeCapabilityComposer = () => {
    setEditCapabilityIndex(-1);
    setComposerVisible(false);
  };

  const addOrEditCapability = (capability: SingleCogniteCapability) => {
    let newCapabilities;
    if (editCapabilityIndex === -1) {
      newCapabilities = [...capabilities, capability];
    } else {
      newCapabilities = [...capabilities];
      newCapabilities.splice(editCapabilityIndex, 1, capability);
      setEditCapabilityIndex(-1);
    }
    setCapabilities(newCapabilities);
    triggerChange(newCapabilities);
    scrollToBottom();
  };

  const removeCapability = (index: number) => {
    const newCapabilities = [...capabilities];
    newCapabilities.splice(index, 1);
    setCapabilities(newCapabilities);
    triggerChange(newCapabilities);
  };

  const startEditing = (index: number) => {
    setEditCapabilityIndex(index);
    openCapabilityComposer();
  };

  const capabilityBeingEdited =
    editCapabilityIndex >= 0 ? capabilities[editCapabilityIndex] : null;

  return (
    <div ref={ref}>
      <div style={{ marginBottom: 10, marginTop: 10 }}>
        <CapabilitiesList
          capabilities={capabilities}
          onRemove={removeCapability}
          onEdit={startEditing}
        />
      </div>
      <div>
        <Button icon="Plus" onClick={openCapabilityComposer}>
          {t('capability-add')}
        </Button>
        {composerVisible && (
          <SingleCapabilityEditor
            visible={composerVisible}
            capability={capabilityBeingEdited}
            onOk={addOrEditCapability}
            onCancel={closeCapabilityComposer}
          />
        )}
      </div>
      {scrollToBottomElement}
    </div>
  );
};

export default forwardRef(CapabilitiesSelector);
