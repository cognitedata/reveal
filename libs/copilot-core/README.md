# @cognite/copilot-core

**For now, this is deployed to the `cdf-copilot-core` npm package. We will deploy @cognite org name soon once we have a proper v0.1**

This is the core logic part of copilot, where both the UI and business logic lives. Most apps (ones in fusion) will not need to import the UI part, simply just need to update the business logic.

We will go over how the business logic works first, and UI second.

## Business logic part

In the `src/lib` you will see all the business logic that the Copilot runs, which is 2 parts

1. `processMessage` - given a message from the user, what should we reply and respond with (true if more input is expected, false if no more input from user is allowed).

- params:
  - `message` - the most recent mesage from user
  - `pastMessages` - all of the messages from the user and bot, in order from first to last sent (includes the current message in the first parameter)
  - `async sendMessage` - passes a message to send to the user
- returns: `Promise<Boolean>`, should continue letting users do input or not

2. `getActions` - given the current list of messages, what are some recommended actions that the user can do.

- params:
  - `pastMessages` - all of the messages from the user and bot, in order from first to last sent
- returns: `Promise<Boolean>`, should continue letting users do input or not

<img style="max-width:300px" src="./assets/labeled-example.png" />

These 2 functions are it! you simply create them in the `src/lib/features/<your feature name>` folder, and then make sure the `getActions` and `postMessage` will call the functions in your feature accordingly, feel free to browse around the `src/lib/features` for examples.

Note: if the `pastMesages` are empty, assume you are starting the conversation with the user. Hence the sendMessage is super useful for giving context to the user, while the actions provide some quick ways to get started.

### Message types

There's many different types of messages you can send as a bot, you can see all of them in `src/lib/types.ts`. Each message will get a special type of display out of the box, and you can trust that the UI can handle each type of message with care and intuitive UI.

## Communicating between Copilot <-> App

We communicate between the CoPilot and the App via CustomMessage. We provide a variety of helpers for making this communication easy. To define these special events, there are 2 categories of events and event listener - `fromCopilot` and `toCopilot`, which intuitively describes event (or listening to events) that are "from" or "to" the Copilot.

You first define what those event are like (and their bodies). Notice they are organized in `FromCopilot` and `ToCopilot`. **Be sure to extend CopilotEvents for easy use.**

For example

```typescript
export interface StreamlitEvents extends CopilotEvents {
  FromCopilot: {
    // send code to streamlit
    SEND_CODE: {
      content?: string;
    };
    // get all code from streamlit
    GET_CODE: null;
  };
  ToCopilot: {
    // get all code from streamlit
    GET_CODE_RESPONSE: {
      content?: string;
    };
  };
}
```

Also in this example, we gave unique names for each Event, this is not required, but makes debugging easier.

**Copilot side**

Now, lets say in `processMessage` in Copilot, you want to trigger an event to get all the code, then you can do the following.

In this case, you want to add a way to listen to `GET_CODE_RESPONSE` from the App, and then send a `GET_CODE` to the App.

```typescript
// creates a listener for `GET_CODE_RESPONSE` from Copilot, we will use the returned function later
const removeEventListener = addToCopilotEventListener<StreamlitEvents>(
  'GET_CODE_RESPONSE',
  // creates a handler for `GET_CODE_RESPONSE`
  createToCopilotEventHandler<StreamlitEvents, 'GET_CODE_RESPONSE'>((event) => {
    // do something with the event.content code
    // i.e. oldCode = event.content;
    // ...

    // remove the listener
    removeEventListener();
  })
);

// send the event to the App (from the Copilot) to trigger a response.
sendFromCopilotEvent<StreamlitEvents, 'GET_CODE'>('GET_CODE', null);
```

**App side**

You would do the inverse of the To/From but the same logic as above in the app. However, you can also use the provided hook builder - `createCopilotEventHandlerHooks`.

In this case you are listening to `GET_CODE` from the Copilot, and then sending a `GET_CODE_RESPONSE` to the Copilot.

```typescript
export const { useToCopilotEventHandler, useFromCopilotEventHandler } = createCopilotEventHandlerHooks<StreamlitEvents>();
//...

// in the react component ...

// creates a handler for `GET_CODE` from Copilot
const handler = useCallback(() => {
  // send a `GET_CODE_RESPONSE` to Copilot
  sendToCopilotEvent<StreamlitEvents, 'GET_CODE_RESPONSE'>('GET_CODE_RESPONSE', {
    content: editorRef?.getModel()?.getValue(),
  });
});

// creates a listener for `GET_CODE` from Copilot
useFromCopilotEventHandler('GET_CODE', handler);
```

## UI part

`/src/app` contains all the code for the UI, which is divided in 2, the Button itself and the Chat UI.

<img style="max-width:300px" src="./assets/example.png" />

Most uses of this fusion is not needed as the Button and Chat are globally mounted by the `@cognite/cdf-copilot` subapp (another `app` in this repo.).

The Button triggers the copilot via a CustomEvent via window. This means any other app can simply pass the same CustomEvent and trigger the open / closing of the Chat UI. This is also the way the Chatbot will communicate with other UIs on the screen.

However, this is needed for other non fusion apps to mount the copilot itself.

### How to use the UI aspect of the data model.

Simply import the `Copilot` component from the library and mount it. It expects a valid `sdk` (CogniteClient) and a `feature` name, which it needs to identify the business logic to run. We will go over this in the previous section.

Make sure to create a file like the following

```typescript
/* eslint-disable import/no-webpack-loader-syntax */

/**  This is the built in way how to load the web workers using webpack is with worker-loader */
import MonacoEditorWorker from 'worker-loader?esModule=true&inline=fallback!monaco-editor/esm/vs/editor/editor.worker?worker';
import { Environment as MonacoEditorEnvironment } from 'monaco-editor';

// point here so the context can be used
declare const self: any;

(self as any).MonacoEnvironment = {
  getWorker(_: string, _label: string) {
    // otherwise, load the default web worker from monaco
    return new MonacoEditorWorker();
  },
} as MonacoEditorEnvironment;
```

and import it in the root.

## Running unit tests

Run `nx test copilot-core` to execute the unit tests via [Jest](https://jestjs.io).
