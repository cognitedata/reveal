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
    limitDrawCalls: true,
    limitRenderCost: true
  };
  const defaultCadBudget = { ...viewer.cadBudget };
  const onCadBudgetSettingsChanged = () => {
    const scale = state.factor / 100.0;
    const { limitDownloadedBytes, limitDrawCalls, limitRenderCost } = state;
    viewer.cadBudget = {
      highDetailProximityThreshold: defaultCadBudget.highDetailProximityThreshold * scale,
      geometryDownloadSizeBytes:  limitDownloadedBytes ? defaultCadBudget.geometryDownloadSizeBytes * scale : Infinity,
      maximumNumberOfDrawCalls: limitDrawCalls ? defaultCadBudget.maximumNumberOfDrawCalls * scale : Infinity,
      maximumRenderCost: limitRenderCost ? defaultCadBudget.maximumRenderCost * scale : Infinity,
    };
  };
  uiFolder.add(state, 'factor', 1, 500, 1).name('Budget factor (%)').onChange(onCadBudgetSettingsChanged);
  uiFolder.add(state, 'limitDownloadedBytes').name('Limit bytesize').onChange(onCadBudgetSettingsChanged);
  uiFolder.add(state, 'limitDrawCalls').name('Limit draw calls').onChange(onCadBudgetSettingsChanged);
  uiFolder.add(state, 'limitRenderCost').name('Limit render cost').onChange(onCadBudgetSettingsChanged);
}
