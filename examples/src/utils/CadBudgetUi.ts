/*
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from "@cognite/reveal";
import dat from 'dat.gui';

/**
 * Creates UI controllers for controlling CAD budget relative to the initial
 * budget.
 */
export function initialCadBudgetUi(viewer: Cognite3DViewer, uiFolder: dat.GUI) {
  const state = {
    factor: 100.0,
    limitDownloadedBytes: true,
    limitDrawcalls: true
  };
  const defaultCadBudget = { ...viewer.cadBudget };
  const onCadBudgetSettingsChanged = () => {
    const s = state.factor / 100.0;
    const { limitDownloadedBytes, limitDrawcalls } = state;
    viewer.cadBudget = {
      highDetailProximityThreshold: defaultCadBudget.highDetailProximityThreshold * s,
      geometryDownloadSizeBytes:  limitDownloadedBytes ? defaultCadBudget.geometryDownloadSizeBytes * s : Infinity,
      maximumNumberOfDrawCalls: limitDrawcalls ? defaultCadBudget.maximumNumberOfDrawCalls * s : Infinity
    };
  };
  uiFolder.add(state, 'factor', 1, 500, 5).name('Budget factor (%)').onChange(onCadBudgetSettingsChanged);
  uiFolder.add(state, 'limitDownloadedBytes').name('Limit bytesize').onChange(onCadBudgetSettingsChanged);
  uiFolder.add(state, 'limitDrawcalls').name('Limit draw cals').onChange(onCadBudgetSettingsChanged);
}
