/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RevealCanvas, RevealToolbar, type AddResourceOptions, RevealContext } from '../src';
import { Color } from 'three';
import { type ReactElement } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchComponent from './utilities/SearchComponent';

const queryClient = new QueryClient();
const sdk = createSdkByUrlToken();
const viewsToSearch = [
  { externalId: 'Equipment', space: 'fdx-boys', version: '2540f607085286' },
  { externalId: 'WorkOrderMultiple', space: 'fdx-boys', version: '88e3ae4e99df70' },
  { externalId: 'WorkOrderSingle', space: 'fdx-boys', version: 'd7a3a49b8d473d' }
];

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  return (
    <>
      <RevealCanvas>
        <ReactQueryDevtools buttonPosition="bottom-right" />
        <RevealResourcesFitCameraOnLoad
          resources={resources}
          defaultResourceStyling={{
            cad: {
              default: { color: new Color('#efefef') },
              mapped: { color: new Color('#c5cbff') }
            }
          }}
        />
        <RevealToolbar />
      </RevealCanvas>
      <SearchComponent resources={resources} sdk={sdk} viewsToSearch={viewsToSearch} />
    </>
  );
};

const meta = {
  title: 'Example/SearchHooks',
  component: StoryContent,
  tags: ['autodocs']
} satisfies Meta<typeof StoryContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 3544114490298106,
        revisionId: 6405404576933316,
        styling: {
          default: {
            color: new Color('#efefef')
          },
          mapped: {
            color: new Color('#c5cbff')
          }
        }
      },
      {
        modelId: 7646043527629245,
        revisionId: 6059566106376463
      }
    ]
  },
  render: ({ resources }: { resources: AddResourceOptions[] }) => {
    return (
      <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
        <QueryClientProvider client={queryClient}>
          <StoryContent resources={resources} />
        </QueryClientProvider>
      </RevealContext>
    );
  }
};
