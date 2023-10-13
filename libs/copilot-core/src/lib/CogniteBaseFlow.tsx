import { CogniteClient } from '@cognite/sdk';

import { CopilotAction, CopilotBotResponse, UserAction } from './types';

export abstract class Flow<T, O extends CopilotBotResponse> {
  public abstract label: string;
  public abstract description: string;

  constructor(
    public fields: Partial<T> & {
      sdk: CogniteClient;
      getActions?: { [key in O['type']]: (data: O) => CopilotAction[] };
    }
  ) {}

  public abstract run: (
    fields: T & { sdk: CogniteClient }
  ) => Promise<Omit<O, 'replyTo'>>;

  /**
   * Only for chat UI, if implemented then it will appear in the CogPilot
   */
  public chatRun:
    | ((
        sendResponse: (response: Omit<CopilotBotResponse, 'replyTo'>) => void,
        setStatus: (status: {
          status: string;
          stage?: number | undefined;
        }) => void
      ) => Promise<UserAction | undefined>)
    | undefined;
}
