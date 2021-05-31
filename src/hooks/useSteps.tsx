import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AppStateContext } from 'context';
import {
  moveToStep,
  WorkflowStep,
  getActiveWorkflowStep,
} from 'modules/workflows';

import { useActiveWorkflow } from 'hooks';
import routesMap from 'routes/routesMap';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';

export const usePrevAndNextStep = (step?: WorkflowStep) => {
  const history = useHistory();
  const { tenant } = useContext(AppStateContext);
  const { workflowId } = useActiveWorkflow();

  const routes = routesMap();

  const goToNextStep = (...args: any) => {
    trackUsage(PNID_METRICS.navigation.nextButton, {
      step,
    });
    const currentStepIndex = routes.findIndex(
      (route) => route.workflowStepName === step
    );
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < routes.length) {
      const stepNext = routes[nextStepIndex];
      if (args) history.push(stepNext.path(tenant, workflowId, ...args));
      else history.push(stepNext.path(tenant, workflowId));
    }
  };

  const goToPrevStep = (...args: any) => {
    trackUsage(PNID_METRICS.navigation.backButton, {
      step,
    });
    const currentStepIndex = routes.findIndex(
      (route) => route.workflowStepName === step
    );
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      const stepPrev = routes[prevStepIndex];
      if (args) history.push(stepPrev.path(tenant, workflowId, ...args));
      else history.push(stepPrev.path(tenant, workflowId));
    } else {
      history.goBack();
    }
  };

  return {
    goToNextStep,
    goToPrevStep,
  };
};

export const useLoadStepOnMount = (step?: WorkflowStep) => {
  const dispatch = useDispatch();
  const prevStep = useSelector(getActiveWorkflowStep);
  if (step && prevStep !== step) {
    dispatch(moveToStep(step));
  }
};
