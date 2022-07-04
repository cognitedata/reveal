import { uuid4 } from '@sentry/utils';
import { SourceNodeData } from 'components/NodeEditor/V2/Nodes/SourceNode';
import { NodeDataVariants } from 'components/NodeEditor/V2/types';
import {
  ChartWorkflow,
  ChartWorkflowV2,
} from 'models/charts/charts/types/types';
import { FlowElement, FlowExportObject } from 'react-flow-renderer';

export const toggleDownloadChartElements = (hide: boolean, height?: number) => {
  const elementsToHide = document.getElementsByClassName('downloadChartHide');
  const chartViewEl = document.getElementById('chart-view');
  const splitPane = (
    document.getElementsByClassName('SplitPane')[0] as HTMLElement
  ).style;
  if (hide) {
    const pane2Height = +(
      document.getElementsByClassName('Pane2')[0] as HTMLElement
    ).style.height.replace('px', '');
    Array.prototype.forEach.call(elementsToHide, (el) => {
      el.style.display = 'none';
    });
    if (chartViewEl) {
      chartViewEl.style.overflow = 'auto';
      chartViewEl.style.height = 'auto';
    }
    splitPane.overflow = 'auto';
    splitPane.display = 'block';
    splitPane.position = 'relative';
    (
      document.getElementsByClassName('Pane1')[0] as HTMLElement
    ).style.height = `${window.innerHeight - pane2Height - 130}px`;
    (document.getElementsByClassName('Pane2')[0] as HTMLElement).style.height =
      'auto';
    (
      document.getElementsByClassName('Resizer')[0] as HTMLElement
    ).style.display = 'none';
    (
      document.getElementsByClassName('PageLayout')[0] as HTMLElement
    ).style.height = 'auto';
    return pane2Height;
  }
  Array.prototype.forEach.call(elementsToHide, (el: HTMLElement) => {
    el.style.display =
      el.nodeName === 'TH' || el.nodeName === 'TD' ? 'table-cell' : 'flex';
  });
  if (chartViewEl) {
    chartViewEl.style.overflow = 'hidden';
    chartViewEl.style.height = '100%';
  }
  splitPane.overflow = 'hidden';
  splitPane.display = 'flex';
  splitPane.position = 'absolute';
  (document.getElementsByClassName('Pane1')[0] as HTMLElement).style.height =
    'auto';
  (
    document.getElementsByClassName('Pane2')[0] as HTMLElement
  ).style.height = `${height}px`;
  (document.getElementsByClassName('Resizer')[0] as HTMLElement).style.display =
    'block';
  (
    document.getElementsByClassName('PageLayout')[0] as HTMLElement
  ).style.height = '100vh';
  return 0;
};

export const downloadImage = (
  image: string | undefined,
  chartName: string | undefined
) => {
  if (!image) {
    return;
  }
  const a = document.createElement('a');
  a.href = image;
  a.download = `${chartName}.png`;
  a.click();
};

export const formatCalculationsForDownload = (
  calculations: ChartWorkflow[] = [],
  getId: () => string = uuid4
) => {
  const filteredCalculations = calculations.filter(
    (calc) => calc.version === 'v2'
  ) as ChartWorkflowV2[];

  const formattedCalculations = filteredCalculations.reduce(
    (resultingCalculations, currentCalculation) => {
      const newId = getId();
      return resultingCalculations.map((selectedCalculation) => {
        return {
          ...selectedCalculation,
          id:
            selectedCalculation.id === currentCalculation.id
              ? newId
              : selectedCalculation.id,
          flow: {
            ...selectedCalculation.flow,
            elements: (
              (selectedCalculation.flow?.elements ||
                []) as FlowElement<NodeDataVariants>[]
            ).map((item) => {
              if (
                item.type === 'CalculationInput' &&
                (item as FlowElement<SourceNodeData>).data?.type ===
                  'workflow' &&
                (item as FlowElement<SourceNodeData>).data?.selectedSourceId ===
                  currentCalculation.id
              ) {
                return {
                  ...item,
                  data: {
                    ...item.data,
                    selectedSourceId: newId,
                  },
                } as FlowElement<SourceNodeData>;
              }
              return item;
            }),
          } as FlowExportObject<NodeDataVariants>,
        };
      });
    },
    filteredCalculations
  );

  return formattedCalculations;
};

export const downloadCalculations = (
  calculations: ChartWorkflow[],
  calculationName: string | undefined
) => {
  if (!calculations.length) {
    return;
  }

  const formattedCalculations = formatCalculationsForDownload(calculations);
  const a = document.createElement('a');
  const url = window.URL.createObjectURL(
    new Blob([JSON.stringify(formattedCalculations)])
  );
  a.href = url;
  a.download = `Calculations from ${calculationName}.json`;
  a.click();
};
