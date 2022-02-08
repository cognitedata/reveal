import { linearInterpolation, linspace, mean } from './mathUtils';

export interface Datapoint {
  timestamp: Date;
  value: number;
}

/**
 * Models a time series with `time` represented by a numeric array of milliseconds since epoch and `data` represented by
 * a numeric array of data point values.
 * @param {number[]} time The time array of milliseconds since epoch.
 * @param {number[]} data The data array of data point values.
 * @param {number} granularity The granularity of the time series. If not provided, it will be computed from the data.
 * @param {boolean} isStep Wether the time series should be considered a step time series. Defaults to false.
 */
export class Timeseries {
  time: number[];
  data: number[];
  count: number;
  isStep: boolean;
  granularity: number;
  deltaTime: number[] = [];
  minDeltaTime = 0;
  maxDeltaTime = 0;
  minTime: number;
  maxTime: number;

  // TODO(SIM-000) evaluate if granularity and isStep can be read from Datapoints
  static fromDatapoints(datapoints: Datapoint[]) {
    // FIXME(SIM-209): Refactor to use Datapoint[] internally
    const time = datapoints.map((d) => d.timestamp.getTime());
    const data = datapoints.map((d) => d.value);
    return new Timeseries(time, data);
  }

  constructor(
    time: number[],
    data: number[],
    granularity?: number,
    isStep = false
  ) {
    if (time.length !== data.length) {
      throw new Error('time and data must have the same length');
    }
    if (data.length === 0) {
      throw new Error('the input data is empty');
    }

    this.time = time;
    this.data = data;
    this.count = time.length;
    this.isStep = isStep;
    this.granularity = granularity ?? this.minDeltaTime;

    // sort the time and data arrays based on time
    this.sortByTime();
    [this.minTime] = this.time;
    this.maxTime = this.time[this.count - 1];

    this.removeDuplicates();
    this.count = time.length;

    // calculate the delta time
    this.calculateDeltaTime();
  }

  /**
   * Sorts the time and data arrays based on time.
   */
  private sortByTime() {
    const sortedTime = this.time.slice();
    const sortedData = this.data.slice();

    // combine the arrays
    const list = [];
    for (let i = 0; i < this.time.length; i++) {
      list.push({ time: this.time[i], data: this.data[i] });
    }

    // sort by time
    list.sort((a, b) => {
      if (a.time < b.time) {
        return -1;
      }
      if (a.time > b.time) {
        return 1;
      }
      return 0;
    });

    // separate the arrays again
    for (let k = 0; k < list.length; k++) {
      sortedTime[k] = list[k].time;
      sortedData[k] = list[k].data;
    }

    this.time = sortedTime;
    this.data = sortedData;
  }

  /**
   * Removes duplicated timestamps from the time and data arrays.
   */
  private removeDuplicates() {
    const timeUnique: number[] = [];
    const dataUnique: number[] = [];
    for (let i = 0; i < this.time.length; i++) {
      if (!timeUnique.includes(this.time[i])) {
        timeUnique.push(this.time[i]);
        dataUnique.push(this.data[i]);
      }
    }
    this.time = timeUnique;
    this.data = dataUnique;
  }

  /**
   * Calculates the time difference between successive time points, the minimum and maximum time differences.
   */
  private calculateDeltaTime() {
    // checks if there is at least two time points
    if (this.time.length > 1) {
      this.minDeltaTime = this.time[1] - this.time[0];
      this.maxDeltaTime = this.time[1] - this.time[0];

      for (let i = 0; i < this.time.length - 1; i++) {
        const dt = this.time[i + 1] - this.time[i];

        if (dt > this.maxDeltaTime) {
          this.maxDeltaTime = dt;
        }

        if (dt < this.minDeltaTime) {
          this.minDeltaTime = dt;
        }

        this.deltaTime.push(dt);
      }
    }
  }

  /**
   * Slices a Timeseries according to the provided boundaries.
   * @param {number} startTime The start time.
   * @param {number} endTime The end time.
   * @returns {Timeseries} The sliced Timeseries.
   */
  slice(startTime: number, endTime: number): Timeseries {
    const i0 = this.time.indexOf(startTime);
    let i1 = this.time.indexOf(endTime);

    // check if the provided times do exist
    if (i0 === -1 || i1 === -1) {
      throw new Error('the provided times do not exist');
    } else {
      i1 += 1; // include the endTime
      return new Timeseries(
        this.time.slice(i0, i1),
        this.data.slice(i0, i1),
        this.granularity,
        this.isStep
      );
    }
  }

  /**
   * Resamples a Timeseries into an equally spaced Timeseries.
   * @param {number} startTime Defines the start time of the resampled Timeseries (optional).
   * @param {number} endTime Defines the end time of the resampled Timeseries (optional).
   * @param {number} granularity Defines the granularity (in milliseconds) of the resampled Timeseries (optional).
   * @returns {Timeseries} The resampled Timeseries.
   */
  getEquallySpacedResampled(
    startTime: number = this.minTime,
    endTime: number = this.maxTime,
    granularity: number = this.granularity
  ): Timeseries {
    let timeResampled;
    let dataResampled;

    // it is only possible to extrapolate beyond the last data point for step timeseries
    if (!this.isStep && endTime > this.maxTime) {
      throw new Error(
        'The given endTime would result in extrapolation which is only allowed for step timeseries.'
      );
    }
    // It is not possible to extrapolate beyond the first data point for any timeseries
    if (startTime < this.minTime) {
      throw new Error('The given startTime is smaller than the minimum time.');
    }
    // if there are no gaps in the time array and no change in the start/end, we don't need to perform resampling
    if (
      this.minDeltaTime === this.maxDeltaTime &&
      endTime === this.maxTime &&
      startTime === this.minTime
    ) {
      timeResampled = this.time;
      dataResampled = this.data;
    } else {
      timeResampled = linspace(startTime, endTime, granularity);
      dataResampled = new Array<number>(timeResampled.length);

      // counter for original array index
      let i = 0;
      // counter for resampled array index
      let j = 0;
      do {
        if (timeResampled[j] > this.time[i]) {
          // the new point is positioned after the current point in the original array
          dataResampled[j] = this.resample(i, timeResampled[j]);
          // we cannot increase i past the end of the original array
          i = Math.min(i + 1, this.time.length - 1);
        } else if (timeResampled[j] === this.time[i]) {
          // the new point is positioned exactly on top of the current point in the original array
          dataResampled[j] = this.data[i];
          // we cannot increase i past the end of the original array
          i = Math.min(i + 1, this.time.length - 1);
        } else if (timeResampled[j] < this.time[i]) {
          // the new point is positioned before the current point in the original array
          dataResampled[j] = this.resample(i - 1, timeResampled[j]);
        }
        j += 1;
      } while (j < timeResampled.length);
    }
    return new Timeseries(
      timeResampled,
      dataResampled,
      granularity,
      this.isStep
    );
  }

  /**
   * Resamples the data at the given time.
   * @param {number} idx The index of the data point in the original array.
   * @param {number} xp The time of the new point.
   * @returns {number} The resampled value.
   */
  private resample(idx: number, xp: number): number {
    if (this.isStep) {
      return this.data[idx];
    }
    return linearInterpolation(
      this.time[idx],
      this.data[idx],
      this.time[idx + 1],
      this.data[idx + 1],
      xp
    );
  }

  /**
   * Returns the average value of the data points in a Timeseries.
   * @returns {number} The mean value.
   */
  getTimeseriesAverage(): number {
    const resampled = this.getEquallySpacedResampled();
    return mean(resampled.data);
  }
}
