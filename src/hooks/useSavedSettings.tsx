import { useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store';
import { AppStateContext } from 'context';
import { changeOptions, standardModelOptions } from 'modules/workflows';
import { useActiveWorkflow } from 'hooks';

/**
 *
 */
export const useSavedSettings = () => {
  const dispatch = useDispatch();
  const { workflowId } = useActiveWorkflow();
  const {
    setSavedSettings,
    skipSettings,
    setSkipSettings,
    modelSelected,
    setModelSelected,
  } = useContext(AppStateContext);

  const { options } = useSelector(
    (state: RootState) => state.workflows.items[workflowId]
  );

  useEffect(() => {
    if (!skipSettings) {
      setSavedSettings({ skip: false });
    } else
      setSavedSettings({
        modelSelected,
        options,
        skip: skipSettings,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipSettings, options, modelSelected]);

  useEffect(() => {
    if (modelSelected === 'standard') {
      dispatch(changeOptions(standardModelOptions));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelSelected]);

  return {
    skipSettings,
    setSkipSettings,
    modelSelected,
    setModelSelected,
  };
};
