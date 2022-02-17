import { select } from 'd3';
import get from 'lodash/get';
import head from 'lodash/head';

import { LogViewer, Track } from '@cognite/videx-wellog';

import { NO_LOGS_LEGEND_MESSAGE } from 'pages/authorized/search/well/inspect/constants';

import { LogData } from './interfaces';

const RULER_HEIGHT = 2;
const ELEMENT_CHECK_INTERVAL = 100;
const ELEMENT_MAX_WAIT = 5000;

export const addFrmRulers = (instance: LogViewer): void => {
  const frmTracks = instance.tracks.filter(
    (track) => track.options.abbr === 'Frm'
  );

  if (!frmTracks.length) return;

  let checkCount = 0;
  const checkFrmElmExist = setInterval(() => {
    const firstFrmTrack = head(frmTracks);
    if (
      firstFrmTrack?.elm &&
      head(firstFrmTrack?.elm?.childNodes)?.childNodes.length
    ) {
      addFrmRulersHelper(instance, firstFrmTrack);
      clearInterval(checkFrmElmExist);
    } else if (checkCount >= ELEMENT_MAX_WAIT / ELEMENT_CHECK_INTERVAL) {
      // clear interval if its reached maximum wait time
      clearInterval(checkFrmElmExist);
    }
    checkCount += 1;
  }, ELEMENT_CHECK_INTERVAL);
};

const addFrmRulersHelper = (instance: LogViewer, frmTrack: Track): void => {
  const elm = instance.overlay.create('frmRulers', {
    onRescale: () => {
      frmTrack.elm.childNodes.forEach((svg) => {
        svg.childNodes.forEach((gTag, index) => {
          const label = labels?.[index];
          const gTagLocation = get(gTag, '__data__');
          const rulerTop = gTagLocation.y - index * RULER_HEIGHT;
          if (elm.childNodes[index]) {
            const selected =
              select(elm.childNodes[index] as HTMLElement).attr('selected') ===
              'true';

            select(elm.childNodes[index] as HTMLElement)
              .style('top', `${rulerTop}px`)
              .style(
                'visibility',
                selected && gTagLocation.y > 0 ? 'visible' : 'hidden'
              );

            gTag.childNodes.forEach((gTagChild) => {
              if (
                gTagChild.nodeName === 'rect' &&
                get(gTagChild, 'classList.value') === 'block-bg'
              ) {
                const fillColor = groupColors[label];
                if (fillColor) {
                  select(gTagChild as HTMLElement).style('fill', fillColor);
                  // Set label rect fill color
                  gTag.childNodes.forEach((gTagLabelBlock) => {
                    if (
                      gTagLabelBlock.nodeName === 'rect' &&
                      get(gTagLabelBlock, 'classList.value') ===
                        'block-label-bg'
                    ) {
                      select(gTagLabelBlock as HTMLElement)
                        .style('fill', fillColor)
                        .style('stroke', 'none');
                    }
                  });
                }
              }
            });
          }
        });
      });
    },
  });

  const frmRulers = select(elm).classed('frmRulers', true).style('top', '10px');

  const groupColors: { [key: string]: string } = {};

  const labels: string[] = get(frmTrack, 'labels');

  frmTrack.elm.childNodes.forEach((svg) => {
    svg.childNodes.forEach((gTag, index) => {
      const { label, fillColor } = getFormRuleProperties(
        gTag,
        index,
        labels,
        groupColors
      );

      const gTagLocation = get(gTag, '__data__');
      const rulerTop = (gTagLocation?.y || 0) - index * RULER_HEIGHT;

      if (!label) return;

      frmRulers
        .append('div')
        .attr('title', label)
        .attr('selected', false)
        .style('height', `${RULER_HEIGHT}px`)
        .style('background-color', fillColor)
        .style('position', 'relative')
        .style('cursor', 'pointer')
        .style('pointer-events', 'auto')
        .style('visibility', 'hidden')
        .style('top', `${rulerTop}px`);
    });
  });
};

export const getFormRuleProperties = (
  gTag: ChildNode,
  index: number,
  labels: string[],
  groupColors: { [key: string]: string } = {}
) => {
  const label = labels?.[index];

  let fillColor = '';
  if (!label) return { label, fillColor };

  const nodeNames = ['rect', 'RECT'];
  gTag.childNodes.forEach((gTagChild) => {
    if (
      nodeNames.includes(gTagChild.nodeName) &&
      get(gTagChild, 'classList.value') === 'block-bg'
    ) {
      fillColor = get(gTagChild, 'style.fill', '');
      if (groupColors[label]) {
        fillColor = groupColors[label];

        // Set main rect fill color
        select(gTagChild as HTMLElement).style('fill', fillColor);

        // Set label rect fill color
        gTagChild.childNodes.forEach((gTagLabelBlock) => {
          if (
            nodeNames.includes(gTagChild.nodeName) &&
            get(gTagLabelBlock, 'classList.value') === 'block-label-bg'
          ) {
            select(gTagLabelBlock as HTMLElement)
              .style('fill', fillColor)
              .style('stroke', 'none');
          }
        });
      } else {
        // eslint-disable-next-line no-param-reassign
        groupColors[label] = fillColor;
      }
    }
  });

  return { label, fillColor };
};

export const viewFrmRulers = (
  instance: HTMLElement,
  selectedMarkers: string[]
): void => {
  if (!instance) return;
  const overlay = instance.getElementsByClassName('overlay');

  if (!overlay || !overlay.length) return;

  const frmRulers: HTMLCollectionOf<Element> | undefined =
    head(overlay)?.getElementsByClassName('frmRulers');

  if (!frmRulers || !frmRulers.length) return;

  head(frmRulers)?.childNodes.forEach((childNode, index) => {
    const title = select(childNode as HTMLElement).attr('title');
    const selected = selectedMarkers.includes(title);
    const topValue = Number(
      select(childNode as HTMLElement)
        .style('top')
        .replace('px', '')
    );
    const yCode = topValue + index * RULER_HEIGHT;
    select(childNode as HTMLElement)
      .style(
        'visibility',
        selectedMarkers.includes(title) && yCode > 0 ? 'visible' : 'hidden'
      )
      .attr('selected', selected);
  });
};

export const disableEmptyLegends = (container: HTMLElement) => {
  // This is used to hide null events and append title for event blocks
  let checkCount = 0;
  const checkExist = setInterval(() => {
    if (checkCount >= ELEMENT_MAX_WAIT / ELEMENT_CHECK_INTERVAL) {
      // clear interval if its reached maximum wait time
      clearInterval(checkExist);
    } else if (container) {
      const legendLabels: HTMLCollectionOf<Element> =
        container.getElementsByClassName('legend-label');

      if (legendLabels.length > 0) {
        for (let i = 0; i < legendLabels.length; i++) {
          if (legendLabels[i].textContent?.includes(NO_LOGS_LEGEND_MESSAGE))
            select(legendLabels[i].parentElement)
              .style('opacity', '0.25')
              .style('cursor', 'unset');
        }
        clearInterval(checkExist);
      }
    }
    checkCount += 1;
  }, ELEMENT_CHECK_INTERVAL);
};

export const updateRanges = (logData: LogData, tracksState: any[]) => {
  if (tracksState.length) {
    Object.keys(logData).forEach((trackKey) => {
      if (logData[trackKey].domain) {
        tracksState.forEach((track) => {
          if (track.plots && track.setPlotOption && track.legendUpdate) {
            track.plots.forEach((plot: any) => {
              if (
                plot.id === trackKey &&
                JSON.stringify(logData[trackKey].domain) !==
                  JSON.stringify(plot.options.domain)
              ) {
                track.setPlotOption(
                  trackKey,
                  'domain',
                  logData[trackKey].domain
                );
                track.legendUpdate();
              }
            });
          }
        });
      }
    });
  }
};
