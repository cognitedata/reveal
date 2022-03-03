import { Calculation, Operation } from '@cognite/calculation-backend';

export const passthroughOperationDefinition: Operation = {
  category: 'None',
  op: 'PASSTHROUGH',
  versions: [
    {
      description: 'Passthrough',
      inputs: [
        {
          description: null,
          name: 'Time series',
          param: 'series',
          types: ['ts'],
        },
      ],
      name: 'Passthrough step used for output nodes',
      version: '1.0',
    },
  ],
} as Operation;

export const validateSteps = (
  steps: Calculation['steps'],
  operations?: Operation[]
): boolean => {
  if (!operations) {
    return false;
  }

  const operationDefinitions = [...operations, passthroughOperationDefinition];

  if (!steps.length) {
    return false;
  }

  return steps.every((step) => {
    const operationDefinition = operationDefinitions?.find(
      ({ op }) => step.op.toLowerCase() === op.toLowerCase()
    );

    if (!operationDefinition) {
      return false;
    }

    const versionDefinition = operationDefinition.versions.find(
      ({ version }) => step.version.toLowerCase() === version.toLowerCase()
    );

    if (!versionDefinition) {
      return false;
    }

    if (step.inputs.length !== versionDefinition.inputs.length) {
      return false;
    }

    return versionDefinition.inputs.every((_, inputIndex) => {
      const correspondingStepInput = step.inputs[inputIndex];

      if (!correspondingStepInput) {
        return false;
      }

      const inputValueIsSet =
        typeof correspondingStepInput.value !== 'undefined' &&
        correspondingStepInput.value !== null &&
        correspondingStepInput.value !== '';

      if (!inputValueIsSet) {
        return false;
      }

      return true;
    });
  });
};
