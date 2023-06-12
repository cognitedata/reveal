import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useActiveWorkflow } from '@interactive-diagrams-app/hooks';
import {
  moveToStep,
  WorkflowStep,
  getActiveWorkflowSteps,
} from '@interactive-diagrams-app/modules/workflows';
import { routesMap } from '@interactive-diagrams-app/routes/routesMap';
import { RootState } from '@interactive-diagrams-app/store';
import { getUrlWithQueryParams } from '@interactive-diagrams-app/utils/config';
import {
  PNID_METRICS,
  trackUsage,
} from '@interactive-diagrams-app/utils/Metrics';

export const useSteps = (step?: WorkflowStep) => {
  const navigate = useNavigate();
  const { workflowId } = useActiveWorkflow();

  const routes = routesMap();

  const goToNextStep = (skipStep = false, ...args: any) => {
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
        navigate(getUrlWithQueryParams(stepNext.path(workflowId, ...args)));
      else navigate(getUrlWithQueryParams(stepNext.path(workflowId)));
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
        navigate(getUrlWithQueryParams(stepPrev.path(workflowId, ...args)));
      else navigate(getUrlWithQueryParams(stepPrev.path(workflowId)));
    } else {
      navigate(-1);
    }
  };

  return {
    goToNextStep,
    goToPrevStep,
  };
};

export const useGoToStep = () => {
  const navigate = useNavigate();
  const { workflowId } = useActiveWorkflow();

  const routes = routesMap();

  const goToStep = (stepToGo?: WorkflowStep) => {
    trackUsage(PNID_METRICS.navigation.moveToStep, {
      stepToGo,
    });
    const step = routes.find((route) => route.workflowStepName === stepToGo);
    if (!step) return;
    navigate(getUrlWithQueryParams(step.path(workflowId)));
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
