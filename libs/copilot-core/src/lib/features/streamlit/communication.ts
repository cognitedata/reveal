import { CopilotEvents } from '../../types';

export interface StreamlitEvents extends CopilotEvents {
  FromCopilot: {
    // send code to streamlit
    SEND_CODE: {
      content?: string;
    };
    // get code from selected area
    GET_CODE_FOR_SELECTION: null;
    // get all code from streamlit
    GET_CODE: null;
  };
  ToCopilot: {
    // get code from selected area
    GET_CODE_FOR_SELECTION_RESPONSE: {
      content?: string;
    };
    // get all code from streamlit
    GET_CODE_RESPONSE: {
      content?: string;
    };
  };
}
