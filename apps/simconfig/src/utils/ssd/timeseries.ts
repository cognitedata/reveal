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
 */
export class Timeseries {
  time: number[];
  data: number[];
  count: number;
  deltaTime: number[] = [];
  minDeltaTime = 0;
  maxDeltaTime = 0;
  minTime: number;
  maxTime: number;

  static fromDatapoints(datapoints: Datapoint[]) {
    // FIXME(SIM-209): Refactor to use Datapoint[] internally
    const time = datapoints.map((d) => d.timestamp.getTime());
    const data = datapoints.map((d) => d.value);
    return new Timeseries(time, data);
  }

  constructor(time: number[], data: number[]) {
    if (time.length !== data.length) {
      throw new Error('time and data must have the same length');
    }
    if (data.length === 0) {
      throw new Error('the input data is empty');
    }

    this.time = time;
    this.data = data;
    this.count = time.length;

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
      return new Timeseries(this.time.slice(i0, i1), this.data.slice(i0, i1));
    }
  }

  /**
   * Resamples a Timeseries into an equally spaced Timeseries.
   * @param {boolean} isStep If true, the resampling is done using forward filling. If false, the resampling is done
   * using linear interpolation.
   * @returns {Timeseries} The resampled Timeseries.
   */
  getEquallySpacedResampled(isStep: boolean): Timeseries {
    let timeResampled;
    let dataResampled;

    if (this.minDeltaTime === this.maxDeltaTime) {
      // if there are no gaps in the time array, we don't need to perform resampling
      timeResampled = this.time;
      dataResampled = this.data;
    } else {
      timeResampled = linspace(this.minTime, this.maxTime, this.minDeltaTime);
      dataResampled = new Array<number>(timeResampled.length);

      // counter for original array index
      let i = 0;
      // counter for resampled array index
      let j = 0;
      do {
        // Try to find the current time in the original array
        const idx = this.time.indexOf(timeResampled[j]);

        if (idx !== -1) {
          dataResampled[j] = this.data[idx];
          i += 1;
        } else if (isStep) {
          // forward fill the last available value
          dataResampled[j] = this.data[i - 1];
        } else {
          // calculate the missing data point using linear interpolation
          dataResampled[j] = linearInterpolation(
            this.time[i - 1],
            this.data[i - 1],
            this.time[i],
            this.data[i],
            timeResampled[j]
          );
        }
        j += 1;
      } while (j < timeResampled.length);
    }
    return new Timeseries(timeResampled, dataResampled);
  }

  /**
   * Returns the average value of the data points in a Timeseries.
   * @returns {number} The mean value.
   */
  getTimeseriesAverage(): number {
    const resampled = this.getEquallySpacedResampled(false);
    return mean(resampled.data);
  }
}
