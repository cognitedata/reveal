import { getChatCompletions } from '@data-exploration-lib/domain-layer';

import sdk from '@cognite/cdf-sdk-singleton';

import { CopilotMessage, ProcessMessageFunc } from '../../types';
import {
  FromCopilotEvent,
  createToCopilotEventHandler,
  addToCopilotEventListener,
} from '../../utils';

import { StreamlitEvents } from './communication';
import { StreamlitActions } from './getActions';

export const processMessageStreamlit: ProcessMessageFunc = async (
  message,
  pastMessages,
  sendMessage
) => {
  // first message
  if (!message) {
    await sendMessage({
      type: 'text',
      content:
        'I see you are working on a Streamlit app, what would you like assistance with?',
    });
    return true;
  }
  const mostRecentBotMessage = pastMessages
    .slice()
    .reverse()
    .find((el) => el.source === 'bot');
  if (
    // todo fix this to be more robust
    mostRecentBotMessage &&
    mostRecentBotMessage.source === 'bot' &&
    mostRecentBotMessage.type === 'text' &&
    mostRecentBotMessage.content === 'What kind of app do you want to build?'
  ) {
    await sendMessage({
      type: 'text',
      content: 'Generating app...',
    });
    const { newCode, oldCode } = await generateNewApp(message);
    await sendMessage({
      type: 'code',
      content: newCode,
      prevContent: oldCode,
      language: 'python',
      actions: [
        {
          content: 'Use code',
          onClick: () => {
            window.dispatchEvent(
              FromCopilotEvent('SEND_CODE', {
                content: newCode,
              })
            );
          },
        },
      ],
    });
  } else {
    await sendMessage({
      type: 'text',
      content: 'Seeing what you need help with...',
    });

    const action = await identifyProblem(pastMessages);
    if (action === -1) {
      await sendMessage({
        type: 'text',
        content: `We cannot help with that at the moment, do you want to try something else?`,
      });
    } else if (action === 0) {
      await sendMessage({
        type: 'text',
        content: `What kind of app do you want to build?`,
      });
    }
  }

  return true;
};

const generateNewApp = async (query: string) => {
  let oldCode: string | undefined = undefined;

  const removeEventListener = addToCopilotEventListener<StreamlitEvents>(
    'GET_CODE_RESPONSE',
    createToCopilotEventHandler<StreamlitEvents, 'GET_CODE_RESPONSE'>(
      (event) => {
        removeEventListener();
        oldCode = event.content;
      }
    )
  );
  window.dispatchEvent(
    FromCopilotEvent<StreamlitEvents, 'GET_CODE'>('GET_CODE', null)
  );

  const response = await getChatCompletions(
    {
      messages: [
        {
          role: 'user',
          content:
            'You are Cognite CoPilot, an industrial copilot. You will help write streamlit code with data being access from Cognite Data Fusion.',
        },
        {
          role: 'user',
          content: `
You should always start with the following
import streamlit as st
from cognite.client import CogniteClient
client = CogniteClient()

where all authentication is already fixed.

Some examples on what is possible to do using the cognite sdk:
\`\`\`
assets = client.assets.list(limit=50)
time_series = client.time_series.list(limit=100)
assets = client.assets.search(name="21PT1019")
time_series = client.time_series.search(name="21PT1019")
\`\`\`
To get the data frame, you can always do
\`\`\`
df = client.assets.search(name="21PT1019").to_pandas()
\`\`\`
To find time series for an asset and to plot it, you can do
\`\`\`
assets = client.assets.search(name="21PT1019")
\`\`\`
To receive and plot data points, you always have to do it like this
\`\`\`
client.time_series.data.retrieve(id=time_series_id, start="52w-ago").to_pandas().plot()
\`\`\`
When receiving data points, "start" and "end" must be on format <integer>(s|m|h|d|w)-ago or 'now', so "1y-ago" and "1M-ago" are NOT valid. Default to "52w-ago".
Other things you can do is
\`\`\`
events = client.events.list(limit=50)
time_series = client.time_series.list(limit=50)
files = client.files.list(limit=50)
\`\`\`
where you can do same type of search as for assets. If you define the app inside an app() function, remember to call it at the end.
If you create a data frame, remember to do
\`\`\`
df = df.fillna(0)
\`\`\`
to make sure we don't have problems with NaN values.
`,
        },
        {
          role: 'user',
          content: `Now give me Streamlit code that uses the Cognite Python SDK to answer the following: ${query}. Only give pure python code, nothing else.`,
        },
      ],
      temperature: 0.0,
      maxTokens: 2048,
    },
    sdk
  );
  let code = response[0].message.content;
  const start = code.indexOf('```python') + 9;
  const length = code.lastIndexOf('```') - start;
  code = code.substr(start, length);
  return { newCode: code, oldCode };
};

const identifyProblem = async (messages: CopilotMessage[]) => {
  const response = await getChatCompletions(
    {
      messages: [
        {
          role: 'user',
          content:
            'CONTEXT:\nYou are Cognite CoPilot, an industrial copilot. You will help write streamlit code with data being access from Cognite Data Fusion.',
        },
        {
          role: 'user',
          content: `CONTEXT:\nYou have recieved this following sequence of messages in JSON array. The last message is the most recent message from the user, and the first message is what you send. 
\`\`\`
${JSON.stringify(messages)}
\`\`\`
the source of "bot" indicates previous messages from you, the CoPilot, the source "user" implies what the user wants. 
`,
        },
        {
          role: 'user',
          content: `CONTEXT:\nThese are all of the actions you can help with. \n\`Actions\`:
\`\`\`
${JSON.stringify(StreamlitActions)}
\`\`\`
`,
        },
        {
          role: 'user',
          content: `Question:\nIdentify the array index in \`Actions\` where the user intent matches the action (0 is the first item in the array, 1 is second and etc.). \nResponse Format:\nReturn -1 if non of the actions solves the user intent. The user expects the Copilot (you) to answer with just the array index as a number - no explaination. Respond with only the array index, or -1, as a number wrapped in a code block. \nExample:\n\`\`\`0\`\`\``,
        },
      ],
      temperature: 0.0,
      maxTokens: 2048,
    },
    sdk
  );
  let code = response[0].message.content;
  const start = code.indexOf('```') + 3;
  const length = code.lastIndexOf('```') - start;
  code = code.substring(start, start + length);
  return Number(code.trim());
};
