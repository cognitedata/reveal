import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalStorage } from '@cognite/cogs.js';
import isEqual from 'lodash/isEqual';
import { RootState } from 'store';
import { LS_SAVED_SETTINGS } from 'stringConstants';
import {
  WorkflowOptions,
  WorkflowStep,
  changeOptions,
  defaultModelOptions,
} from 'modules/workflows';
import { useActiveWorkflow } from 'hooks';

type ModelSelected = 'standard' | 'advanced';
type Props = {
  step: WorkflowStep;
  modelSelected: ModelSelected;
  shouldSkipSettings: boolean;
};
export const useSavedSettings = (props: Props) => {
  const dispatch = useDispatch();
  const { step, modelSelected, shouldSkipSettings } = props;
  const { workflowId } = useActiveWorkflow(step);
  const options: WorkflowOptions = useSelector(
    (state: RootState) => state.workflows.items[workflowId].options
  );
  const [savedSettings, setSavedSettings] = useLocalStorage(LS_SAVED_SETTINGS, {
    skip: false,
    modelSelected: 'standard',
  });

  useEffect(() => {
    if (shouldSkipSettings) {
      setSavedSettings({ skip: true, ...({ modelSelected, options } ?? {}) });
    } else {
      setSavedSettings({ skip: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelSelected, options, shouldSkipSettings]);

  useEffect(() => {
    if (modelSelected === 'standard') {
      dispatch(changeOptions(defaultModelOptions));
    }
  }, [dispatch, modelSelected]);

  return savedSettings;
};

export const getSelectedModel = (
  options: WorkflowOptions,
  modelSelected?: ModelSelected
) => {
  if (modelSelected) return modelSelected;
  const isStandardModelSelected = isEqual(defaultModelOptions, options);
  if (isStandardModelSelected) return 'standard';
  return 'advanced';
};
