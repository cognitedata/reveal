import { createModel } from 'xstate/lib/model';
import { ClassifierState } from './types';

export interface Model {
  status: { [state in ClassifierState]?: 'done' | 'failed' };
  description: { [state in ClassifierState]?: string };
  classifierId?: number;
}

const model = createModel<Model, any>({
  /** Current classifier id created upon training */
  classifierId: undefined,
  /** Map of completed classifier states */
  status: {},
  /** Dynamic description for each state */
  description: {
    [ClassifierState.TRAIN]: 'Ready to run',
  },
});

export const classifierMachine = model.createMachine({
  id: 'classifier',
  context: model.initialContext,
  initial: ClassifierState.MANAGE,
  states: {
    [ClassifierState.MANAGE]: {
      on: {
        NEXT: {
          target: ClassifierState.TRAIN,
          actions: [
            model.assign({ status: { [ClassifierState.MANAGE]: 'done' } }),
          ],
        },
      },
    },
    [ClassifierState.TRAIN]: {
      on: {
        NEXT: {
          target: ClassifierState.DEPLOY,
          actions: [
            model.assign({
              status: {
                [ClassifierState.MANAGE]: 'done',
                [ClassifierState.TRAIN]: 'done',
              },
            }),
          ],
        },
        PREVIOUS: {
          target: ClassifierState.MANAGE,
          actions: [model.assign({ status: {} })],
        },
      },
    },
    [ClassifierState.DEPLOY]: {
      on: {
        NEXT: {
          target: ClassifierState.COMPLETE,
          actions: [
            model.assign({
              status: {
                [ClassifierState.MANAGE]: 'done',
                [ClassifierState.TRAIN]: 'done',
                [ClassifierState.DEPLOY]: 'done',
              },
            }),
          ],
        },
        PREVIOUS: {
          target: ClassifierState.TRAIN,
          actions: [
            model.assign({ status: { [ClassifierState.MANAGE]: 'done' } }),
          ],
        },
      },
    },
    [ClassifierState.COMPLETE]: {
      type: 'final',
    },
  },
  on: {
    updateDescription: {
      actions: model.assign({
        description: (context, event) => ({
          ...context.description,
          ...event.payload,
        }),
      }),
    },
    setClassifierId: {
      actions: model.assign({
        classifierId: (_context, event) => event.payload,
      }),
    },
  },
});
