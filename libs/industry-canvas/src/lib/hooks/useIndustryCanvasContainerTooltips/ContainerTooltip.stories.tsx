import { ContainerType } from '@cognite/unified-file-viewer';
import { ComponentStory } from '@storybook/react';
import ContainerTooltip from './ContainerTooltip';
import styled from 'styled-components';

export default {
  title: 'Tooltips/Container Tooltip Story',
  component: ContainerTooltip,
};

export const DocumentContainerTooltip: ComponentStory<
  typeof ContainerTooltip
> = () => {
  return (
    <StorybookContainerTooltipWrapper>
      <ContainerTooltip
        container={{
          id: '1',
          type: ContainerType.DOCUMENT,
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          label: 'MH-12-34-56.pdf',
          metadata: {
            resourceId: 123,
          },
        }}
        onUpdateContainer={(...args) => console.log('onUpdateContainer', args)}
        onRemoveContainer={() => console.log('onRemoveContainer')}
        shamefulNumPages={123}
      />
    </StorybookContainerTooltipWrapper>
  );
};

export const ImageContainerTooltip: ComponentStory<
  typeof ContainerTooltip
> = () => {
  return (
    <StorybookContainerTooltipWrapper>
      <ContainerTooltip
        container={{
          id: '1',
          type: ContainerType.IMAGE,
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.png',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          label: 'MH-12-34-56.png',
          metadata: {
            resourceId: 123,
          },
        }}
        onUpdateContainer={(...args) => console.log('onUpdateContainer', args)}
        onRemoveContainer={() => console.log('onRemoveContainer')}
        shamefulNumPages={123}
      />
    </StorybookContainerTooltipWrapper>
  );
};
export const TextContainerTooltip: ComponentStory<
  typeof ContainerTooltip
> = () => {
  return (
    <StorybookContainerTooltipWrapper>
      <ContainerTooltip
        container={{
          id: '1',
          type: ContainerType.TEXT,
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.csv',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          label: 'MH-12-34-56.csv',
          metadata: {
            resourceId: 123,
          },
        }}
        onUpdateContainer={(...args) => console.log('onUpdateContainer', args)}
        onRemoveContainer={() => console.log('onRemoveContainer')}
        shamefulNumPages={123}
      />
    </StorybookContainerTooltipWrapper>
  );
};
export const TableContainerTooltip: ComponentStory<
  typeof ContainerTooltip
> = () => {
  return (
    <StorybookContainerTooltipWrapper>
      <ContainerTooltip
        container={{
          id: '1',
          type: ContainerType.TABLE,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          items: [],
          label: 'Asset: MH-12-34-56',
          metadata: {
            resourceId: 123,
          },
        }}
        onUpdateContainer={(...args) => console.log('onUpdateContainer', args)}
        onRemoveContainer={() => console.log('onRemoveContainer')}
        shamefulNumPages={123}
      />
    </StorybookContainerTooltipWrapper>
  );
};
export const TimeseriesContainerTooltip: ComponentStory<
  typeof ContainerTooltip
> = () => {
  return (
    <StorybookContainerTooltipWrapper>
      <ContainerTooltip
        container={{
          id: '1',
          type: ContainerType.TIMESERIES,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          label: 'MH-12-34-56.pdf',
          dataPoints: [],
          isLoading: false,
          isError: false,
          startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          endDate: new Date(),
          metadata: {
            resourceId: 123,
          },
        }}
        onUpdateContainer={(...args) => console.log('onUpdateContainer', args)}
        onRemoveContainer={() => console.log('onRemoveContainer')}
        shamefulNumPages={123}
      />
    </StorybookContainerTooltipWrapper>
  );
};
export const RevealContainerTooltip: ComponentStory<
  typeof ContainerTooltip
> = () => {
  return (
    <StorybookContainerTooltipWrapper>
      <ContainerTooltip
        container={{
          id: '1',
          type: ContainerType.REVEAL,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          label: 'MH-12-34-56.pdf',
          modelId: 123,
          revisionId: 123,
          metadata: {
            resourceId: 123,
          },
        }}
        onUpdateContainer={(...args) => console.log('onUpdateContainer', args)}
        onRemoveContainer={() => console.log('onRemoveContainer')}
        shamefulNumPages={123}
      />
    </StorybookContainerTooltipWrapper>
  );
};

const StorybookContainerTooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex-direction: column;
  height: 100px;
  width: 500px;
`;
