import React from 'react';

import { SegmentedControl } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

export const FileViewSwitcher = ({
  currentView,
  setCurrentView,
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) => {
  const { t } = useTranslation();

  return (
    <SegmentedControl onButtonClicked={setCurrentView} currentKey={currentView}>
      <SegmentedControl.Button
        key="tree"
        icon="Tree"
        title={t('TREE', 'Tree')}
        aria-label="Tree"
      />
      <SegmentedControl.Button
        key="list"
        icon="List"
        title={t('LIST', 'List')}
        aria-label="List"
      />
    </SegmentedControl>
  );
};
