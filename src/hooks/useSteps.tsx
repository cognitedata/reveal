import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { AppStateContext } from 'context';
import {
  moveToStep,
  WorkflowStep,
  getActiveWorkflowSteps,
} from 'modules/workflows';
import { useActiveWorkflow } from 'hooks';
import { routesMap } from 'routes/routesMap';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { getUrlWithQueryParams } from 'utils/config';
import { RootState } from 'store';

export const useSteps = (step?: WorkflowStep) => {
  const history = useHistory();
  const { tenant } = useContext(AppStateContext);
  const { workflowId } = useActiveWorkflow();

  const routes = routesMap();

  const goToNextStep = (skipStep: boolean = false, ...args: any) => {
    trackUsage(PNID_METRICS.navigation.nextButton, {
      step,
    });
    const currentStepIndex = routes.findIndex(
      (route) => route.workflowStepName === step
    );
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < routes.length) {
      let stepNext = routes[nextStepIndex];
      if (skipStep && stepNext.skippable && nextStepIndex + 1 < routes.length) {
        stepNext = routes[nextStepIndex + 1];
      }
      if (args)
        history.push(
          getUrlWithQueryParams(stepNext.path(tenant, workflowId, ...args))
        );
      else
        history.push(getUrlWithQueryParams(stepNext.path(tenant, workflowId)));
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
      if (args)
        history.push(
          getUrlWithQueryParams(stepPrev.path(tenant, workflowId, ...args))
        );
      else
        history.push(getUrlWithQueryParams(stepPrev.path(tenant, workflowId)));
    } else {
      history.goBack();
    }
  };

  return {
    goToNextStep,
    goToPrevStep,
  };
};

export const useGoToStep = () => {
  const history = useHistory();
  const { tenant } = useContext(AppStateContext);
  const { workflowId } = useActiveWorkflow();

  const routes = routesMap();

  const goToStep = (stepToGo?: WorkflowStep) => {
    trackUsage(PNID_METRICS.navigation.moveToStep, {
      stepToGo,
    });
    const step = routes.find((route) => route.workflowStepName === stepToGo);
    if (!step) return;
    history.push(getUrlWithQueryParams(step.path(tenant, workflowId)));
  };

  return { goToStep };
};

export const useCompletedSteps = () => {
  const steps = useSelector(getActiveWorkflowSteps);
  const lastCompleted = steps?.lastCompleted;
  const routes = routesMap();
  const allSteps = routes.map((route) => route.workflowStepName);
  const completedSteps = allSteps.splice(
    0,
    allSteps.findIndex((route) => route === lastCompleted) + 1
  );
  return completedSteps;
};

export const useCurrentStep = () => {
  const { workflowId } = useActiveWorkflow();
  const currentStep = useSelector(
    (state: RootState) => state.workflows.items[workflowId]?.steps?.current
  );
  return currentStep;
};

export const useLoadStepOnMount = (step?: WorkflowStep) => {
  const dispatch = useDispatch();
  const steps = useSelector(getActiveWorkflowSteps);
  if (step && steps?.current !== step) {
    const lastCompletedStep = getLastCompletedStep(step, steps?.lastCompleted);
    dispatch(moveToStep({ step, lastCompletedStep }));
  }
};

const getLastCompletedStep = (
  stepToGo: WorkflowStep,
  stepLastCompleted?: WorkflowStep
): WorkflowStep | undefined => {
  const routes = routesMap();
  const stepLastCompletedIndex = routes.findIndex(
    (route) => route.workflowStepName === stepLastCompleted
  );
  const stepToGoIndex = routes.findIndex(
    (route) => route.workflowStepName === stepToGo
  );
  if (stepToGoIndex >= stepLastCompletedIndex) return stepToGo;
  return stepLastCompleted;
};
