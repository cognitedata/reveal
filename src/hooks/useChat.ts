declare global {
  interface Window {
    Intercom: any;
  }
}

type UseChatObject = {
  initialized: boolean;
  show: () => void;
  close: () => void;
};

type UseChatResponse = UseChatObject;

export default () => {
  const chatInitialized = !!window.Intercom;
  const dispatchShowChat = () => {
    console.log(window.Intercom);

    if (window.Intercom) {
      console.log('show');

      window.Intercom('show');
    }
  };
  const dispatchCloseChat = () => {
    if (window.Intercom) {
      window.Intercom('hide');
    }
  };
  const out: Partial<UseChatObject> = {};
  out.initialized = chatInitialized;
  out.show = dispatchShowChat;
  out.close = dispatchCloseChat;
  return out as UseChatResponse;
};
