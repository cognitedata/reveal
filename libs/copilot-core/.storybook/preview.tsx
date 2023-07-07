// .storybook/preview.tsx

import React from 'react';

import { Preview } from '@storybook/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import 'highlight.js/styles/dracula.css';
import 'monaco-editor/dev/vs/editor/editor.main.css';
import 'react-resizable/css/styles.css';
import '@cognite/cogs.js/dist/cogs.css';

const queryClient = new QueryClient();
const mockSdk = {};

const preview: Preview = {
  decorators: [
    (Story) => (
      <div id="copilot-wrapper">
        <QueryClientProvider client={queryClient}>
          <SDKProvider sdk={mockSdk as CogniteClient}>
            <Story />
          </SDKProvider>
        </QueryClientProvider>
      </div>
    ),
  ],
};

export default preview;
