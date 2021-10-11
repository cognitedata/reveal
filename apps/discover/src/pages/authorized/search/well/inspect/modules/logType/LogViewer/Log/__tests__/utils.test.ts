import head from 'lodash/head';

import { LogViewer, Track } from '@cognite/videx-wellog';

import {
  mockLogDataFRM,
  mockLogDataMD,
  mockLogDataTVD,
} from '__test-utils/fixtures/log';
import { NO_LOGS_LEGEND_MESSAGE } from 'pages/authorized/search/well/inspect/constants';

import { getScaleHandler } from '../../utils';
import MDTrack from '../trackList/mdTrack';
import { getTrackList } from '../trackList/trackList';
import {
  addFrmRulers,
  disableEmptyLegends,
  getFormRuleProperties,
  updateRanges,
  viewFrmRulers,
} from '../utils';

describe('Log utils', () => {
  it(`should add Frm Rulers`, () => {
    const { domain } = getScaleHandler(mockLogDataMD);
    const logController = new LogViewer({
      showLegend: true,
      horizontal: false,
      domain,
    });
    const container = document.createElement('div');
    container.appendChild(document.createElement('div'));

    const tracks = getTrackList(
      ['TVD', 'FRM', 'MD'],
      { ...mockLogDataFRM, ...mockLogDataTVD, ...mockLogDataMD },
      mockLogDataFRM,
      [
        [15096, 'TGHT'],
        [17470, 'LOST'],
      ]
    );
    const frmTracks: Track[] = tracks.filter(
      (track) => track.options.abbr === 'Frm'
    );
    const firstFrmTrack = head(frmTracks);

    const doc = document.createElement('div');
    const child = doc.appendChild(document.createElement('div'));
    child.appendChild(document.createElement('div'));

    firstFrmTrack?.init(doc, firstFrmTrack.scale);

    logController.init(container).setTracks([firstFrmTrack, ...tracks]);

    jest.useFakeTimers();
    addFrmRulers(logController);
    jest.advanceTimersByTime(100);
  });

  it('should disable Empty Legends', () => {
    const container = document.createElement('div');
    const child = container.appendChild(document.createElement('div'));
    child.classList.add('legend-label');
    const text = document.createTextNode(NO_LOGS_LEGEND_MESSAGE);
    child.append(text);

    jest.useFakeTimers();
    disableEmptyLegends(container);
    jest.advanceTimersByTime(5000);

    expect(container).toHaveStyle({ opacity: '0.25' });
    expect(container).toHaveStyle({ cursor: 'unset' });
  });

  it('should view Frm Rulers', () => {
    const container = document.createElement('div');
    const child = container.appendChild(document.createElement('div'));
    child.classList.add('overlay');

    const childTwo = child.appendChild(document.createElement('div'));
    childTwo.classList.add('frmRulers');

    const childThree = childTwo.appendChild(document.createElement('div'));
    childThree.setAttribute('title', 'title-value');

    viewFrmRulers(container, ['title-value']);

    const overlay = container.getElementsByClassName('overlay');
    const frmRulers: HTMLCollectionOf<Element> | undefined =
      head(overlay)?.getElementsByClassName('frmRulers');

    const childNode = head(frmRulers)?.childNodes[0] as HTMLElement;
    expect(childNode).toHaveStyle({ visibility: 'hidden' });
  });

  it('should get Form Rule Properties', () => {
    const container = document.createElement('div');
    const child = container.appendChild(document.createElement('rect'));
    child.classList.add('block-bg');
    const childTwo = child.appendChild(document.createElement('rect'));
    childTwo.classList.add('block-label-bg');

    getFormRuleProperties(container, 0, ['color'], {
      color: 'red',
    });

    const parent = container.getElementsByClassName('block-bg');
    const firstChilds: HTMLCollectionOf<Element> | undefined =
      head(parent)?.getElementsByClassName('block-label-bg');
    const childNode = head(firstChilds) as HTMLElement;

    expect(childNode).toHaveStyle({ fill: 'red' });
  });

  it('should update Ranges', () => {
    const data = { ...mockLogDataFRM, ...mockLogDataTVD, ...mockLogDataMD };

    const mdTrack: any = MDTrack(1, { ...mockLogDataTVD, ...mockLogDataMD });
    mdTrack.plots = [{ id: 'MD', options: { domain: [123123] } }];
    mdTrack.setPlotOption = jest.fn();
    mdTrack.legendUpdate = jest.fn();

    updateRanges(data, [mdTrack]);

    expect(mdTrack.setPlotOption).toBeCalledTimes(1);
    expect(mdTrack.legendUpdate).toBeCalledTimes(1);
  });
});
