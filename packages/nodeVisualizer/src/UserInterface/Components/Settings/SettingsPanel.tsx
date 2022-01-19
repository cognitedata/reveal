import React, { useState } from 'react';
import { SettingPanelProps } from '@/UserInterface/Components/Settings/Types';
import { SettingsSection } from '@/UserInterface/Components/Settings/SettingsSection/SettingsSection';
import { PanelTitleBar } from '@/UserInterface/Components/PanelTitleBar/PanelTitleBar';
import { NodeUtils } from '@/UserInterface/utils/NodeUtils';
import styled from 'styled-components';

//= =================================================
// Main Settings Panel Component
//= =================================================

export const SettingsPanel = (props: SettingPanelProps) => {
  const {
    id,
    titleBar,
    onSectionExpand,
    onPropertyValueChange,
    onPropertyUseChange,
    expandedSections,
  } = props;

  const [, forceUpdate] = useState(0);

  const sections =
    (NodeUtils.createElementTree(NodeUtils.properties) as any)?.elements ?? [];

  const handleUsePropertyChange = (elementId: string, value: boolean) => {
    onPropertyUseChange(elementId, value);
    forceUpdate((val) => val + 1);
  };

  const handleValueChange = (elementId: string, value: boolean) => {
    onPropertyValueChange(elementId, value);
    forceUpdate((val) => val + 1);
  };

  return (
    <SettingsPanelWrapper>
      {id ? (
        <>
          {titleBar && (
            <PanelTitleBar
              sectionId="-1"
              title={titleBar.name}
              icon={titleBar.icon}
              toolBar={titleBar.toolBar}
            />
          )}
          {sections.map((section) => {
            section.isExpanded = expandedSections[section.id];
            return (
              section.elements.length > 0 && (
                <SettingsSection
                  key={`${section.name}-section`}
                  section={section}
                  onExpand={onSectionExpand}
                  onPropertyValueChange={handleValueChange}
                  onPropertyUseChange={handleUsePropertyChange}
                />
              )
            );
          })}
        </>
      ) : null}
    </SettingsPanelWrapper>
  );
};

const SettingsPanelWrapper = styled.div`
  width: 100%;
  overflow: auto;
  padding: 0 10px;
`;
