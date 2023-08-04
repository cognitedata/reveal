# CogniteChatGPT

Langchain integration of Cognite chat gpt model.

### Chat Messages

A `ChatMessage` is what we refer to as the modular unit of information for a chat model.
At the moment, this consists of a `"text"` field, which refers to the content of the chat message.

There are currently four different classes of `ChatMessage` supported by LangChain:

`HumanMessage`: A chat message that is sent as if from a Human's point of view.

`AIMessage`: A chat message that is sent from the point of view of the AI system to which the Human is corresponding.

`SystemMessage`: A chat message that gives the AI system some information about the conversation. This is usually sent at the beginning of a conversation.

`ChatMessage`: A generic chat message, with not only a "text" field but also an arbitrary "role" field.

To get started, simply use the call method of an LLM implementation, passing in a string input. In this example, we are using the `CogniteChatGPT` implementation:

```typescript
import { CogniteChatGPT } from '@cognite/copilot-core';
import { HumanMessage } from 'langchain/schema';

export const run = async () => {
  const chat = new CogniteChatGPT();
  // Pass in a list of messages to `call` to start a conversation. In this simple example, we only pass in one message.
  const response = await chat.call([
    new HumanMessage(
      'What is a good name for a company that makes colorful socks?'
    ),
  ]);
  console.log(response);
  // AIMessage { text: '\n\nRainbow Sox Co.' }
};
```
