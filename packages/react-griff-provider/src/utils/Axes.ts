import { AxisDomains, Domain } from '../types';
import { placeholder } from './placeholder';

/**
 * We only currently recognize three dimensions: time, x, and y.
 */
export type DomainDimension = 'time' | 'x' | 'y';

/**
 * A {@code Dimension} is a function which is linked to a particular axis of
 * measurement, like time. This function takes in an {@code Domains}
 * and spits out the Domain (or {@code [0, 0]} if there isn't one).
 */
export interface Dimension extends Function {
  (input: AxisDomains): Domain;
  toString: () => string;
}

/**
 * Create a {@code Dimension} for a specific {@code DomainDimension}.
 *
 * @param key the {@code Domain} that this {@code Dimension} operates on
 */
const dimension = (key: DomainDimension): Dimension => {
  const functor: Dimension = (input: AxisDomains) => {
    if (!input) {
      return placeholder(0, 0);
    }
    return input[key];
  };
  functor.toString = () => key;
  return functor;
};

const time: Dimension = dimension('time');
const x: Dimension = dimension('x');
const y: Dimension = dimension('y');

const AXES: {
  time: Dimension;
  x: Dimension;
  y: Dimension;
  HORIZONTAL: Dimension[];
  VERTICAL: Dimension[];
  ALL: Dimension[];
} = {
  /**
   * {@code time} is a reference to the time dimension of the plotted data.
   * Note that not all data necessarily _needs_ to have a time dimension (for
   * example: scatterplots might not have one) but it's required for series
   * which need it, such as a line charts.
   */
  time,

  /**
   * {@code x} is the x-dimension of a plotted point. For time series charts,
   * this axis is not used because that data is inherently tied to time, so
   * {@code time = x}. However, for a scatterplot, this is used to determine
   * where the data point will lie along the x axis.
   */
  x,

  /**
   * {@code y} is the y-dimension of a plotted point. For time series charts,
   * this will likely be the value of a given point. However, scatterplots will
   * use this to place the point along the y axis (for example, by using the
   * value from another coupled time series).
   */
  y,

  HORIZONTAL: [x, time],

  VERTICAL: [y],

  ALL: [time, x, y],
};

export default AXES;
