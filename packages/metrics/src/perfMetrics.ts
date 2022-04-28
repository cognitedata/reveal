import { MutableRefObject } from 'react';
import debounce from 'lodash/debounce';
import { MetricIncrementBody } from '@cognite/frontend-metrics-types';

import { PerfMonitor, PerfMonitorResultsData, Properties } from './types';
import { findInMutation } from './perfMetrics.helper';

const perfMetricsInstance = (() => {
  let frontendMetricsBaseUrl = '';
  let enabled = true;
  const monitoredData: { [key: string]: PerfMonitorResultsData } = {};
  let registeredMonitors: { [key: string]: PerfMonitor } = Object.freeze({});
  let accessToken: string;
  let project: string;
  let initialized = false;
  //  Slow buckets [0.2, 0.4, 1, 3, 5];
  //  Fast buckets [1, 2.5, 4, 10, 25];

  /**
   * Initialize the PerfMetrics instance
   *
   * @param {string} url : URL to the frontend metrics service
   * @param {string} accessToken : Current user's access token
   * @param {string} project : Current project/tenant id
   * */
  function initialize(url: string, token: string, tenant: string): void {
    frontendMetricsBaseUrl = url;
    accessToken = token;
    project = tenant;

    const observer = new PerformanceObserver((list) =>
      processMonitorResults(list)
    );
    observer.observe({ entryTypes: ['mark', 'measure'] });
    initialized = true;
  }

  function processMonitorResults(list: PerformanceObserverEntryList): void {
    list
      .getEntries()
      .filter((item) => {
        return item.name in registeredMonitors;
      })
      .sort((entry) => {
        return entry.entryType === 'mark' ? -1 : 1;
      })
      .forEach((element) => {
        //  _logPerfEntry(element);
        if (element.entryType === 'mark') {
          monitoredData[element.name] = {
            start: element.entryType === 'mark' ? element.startTime : -1,
            end: 0,
            duration: 0,
          };
        } else if (
          element.entryType === 'measure' &&
          element.name in monitoredData
        ) {
          monitoredData[element.name].end = element.duration;
          monitoredData[element.name].duration =
            monitoredData[element.name].end - monitoredData[element.name].start;
          pushEventToServer({
            name: element.name,
            tags: registeredMonitors[element.name].tags || '',
            seconds: monitoredData[element.name].duration / 1000,
            slow: registeredMonitors[element.name].slow,
          });
          delete monitoredData[element.name];
          performance.clearMarks(element.name);
        }
      });
  }

  function enable(): void {
    enabled = true;
  }

  function disable(): void {
    enabled = false;
  }

  function pushEventToServer(
    body: MetricIncrementBody | Properties
  ): Promise<Response> {
    const requestOptions = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'x-cdp-project': project,
      }),
      body: JSON.stringify(body),
    };
    return fetch(`${frontendMetricsBaseUrl}/metrics`, requestOptions);
  }

  function updateRegisteredMonitors(data: PerfMonitor): void {
    registeredMonitors = Object.entries(registeredMonitors)
      .filter(([key]) => key !== data.name)
      .concat([[data.name, { ...data }]])
      .reduce((acc: any, [k, v]) => {
        return { ...acc, [k]: v };
      }, {});
  }

  function checkInitialization() {
    if (!initialized) {
      throw new Error('PerfMetrics has not been intialized');
    }
  }

  /**
   * Used to attach an event listener to a specific DOM event and calculate event durations
   *
   * @param {string} name : Name of tracking event
   * @param {keyof HTMLElementEventMap} eventType : DOM Event listener to attach (e.g click, keypress, mouseenter)
   * @param {string} domSelector : a simple string that selects the DOM element you want to attach the listener to
   * @param {number} selectIndex : index of the element to attach the listener to, in case of multiple DOM elements
   * @param {MutableRefObject<HTMLElement | null>} ref : a reference of the current React Component, we will query for DOM elements matching the selector inside here.
   * */
  function trackPerfEvent(
    name: string,
    eventType: keyof HTMLElementEventMap,
    ref: MutableRefObject<HTMLElement | null>,
    domSelector?: string,
    selectIndex = 0
  ): void {
    checkInitialization();
    if (!enabled) {
      return;
    }
    if (ref.current) {
      const observer = new MutationObserver((_mutationRecords) => {
        performance.measure(name);
      });
      observer.observe(ref?.current, {
        attributes: true,
        subtree: true,
        childList: true,
      });
    }

    const eventHandler = () => performance.mark(name);

    if (domSelector) {
      ref.current?.querySelectorAll(domSelector)?.forEach((item, number) => {
        if (number === selectIndex) {
          item.addEventListener(eventType, eventHandler);
        }
      });
    } else {
      ref.current?.addEventListener(eventType, eventHandler);
    }

    updateRegisteredMonitors({
      name,
      eventType,
      domSelector,
      selectIndex,
      ref,
      callback: eventHandler,
    });
  }

  /**
   * Used to remove an attached event listener from the DOM
   *
   * @param {string} name : Name of tracking event
   */
  function untrackPerfEvent(name: string): void {
    if (name in registeredMonitors) {
      const monitor = registeredMonitors[name];
      if (monitor.domSelector) {
        const items = monitor.ref?.current?.querySelectorAll(
          monitor.domSelector
        );
        items?.forEach((item: any, index: number) => {
          if (index === monitor.selectIndex) {
            item.removeEventListener(monitor.eventType, monitor.callback);
          }
        });
      } else if (monitor.eventType && monitor.callback) {
        monitor.ref?.current?.removeEventListener(
          monitor.eventType,
          monitor.callback
        );
      }
    }
  }

  /**
   * Start the performance tracking timer for an event
   *
   * @param {string} name   : Name of tracking event
   * @param {string} tags   : Can be useful for grouping of events for example all events that belong under search can have the search tag
   * @param {boolean} slow  : Set this true if you expect this to be a slow performing event, this would result in the performance data
   *                          for this event to be stored in a separate slow bucket on Prometheus
   */
  function trackPerfStart(name: string, tags?: string, slow?: boolean): void {
    checkInitialization();
    if (enabled) {
      performance.mark(name);
      updateRegisteredMonitors({ name, tags, slow });
    }
  }

  /**
   * End the performance tracking timer for an event
   *
   * @param {string} name : Name of tracking event
   */
  function trackPerfEnd(name: string): void {
    if (name in registeredMonitors) {
      debounce(
        () => {
          performance.measure(name);
        },
        100,
        { maxWait: 1000 }
      )();
    }
  }

  /**
   * Observe the DOM and fire a callback when there are changes
   *
   * @param {MutableRefObject<HTMLElement | null>} ref : A reference to part of the DOM to observe
   * @param {(mutations: MutationRecord[]) => void>} callback : A callback to fire when the DOM is mutated
   */
  function observeDom(
    ref: MutableRefObject<HTMLElement | null>,
    callback: (mutations: MutationRecord[]) => void
  ): void {
    if (enabled && ref.current) {
      const observer = new MutationObserver((mutationRecords) => {
        callback(mutationRecords);
      });
      observer.observe(ref.current, {
        attributes: true,
        subtree: true,
        childList: true,
      });
    }
  }

  function logPerfEntry(entry: any) {
    if (console) {
      // eslint-disable-next-line no-console
      console.log(
        `[PerfMetrics] Name: ${entry.name} Type: ${entry.entryType} Start: ${entry.startTime} Duration: ${entry.duration}`
      );
    }
  }

  return {
    initialize,
    enable,
    disable,
    trackPerfEvent,
    untrackPerfEvent,
    trackPerfStart,
    trackPerfEnd,
    observeDom,
    findInMutation,
    pushEventToServer,
    logPerfEntry,
  };
})();

export { perfMetricsInstance };
