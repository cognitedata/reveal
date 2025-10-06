import { type Box3, Color, Vector3 } from 'three';
import SeededRandom from 'random-seed';

/**
 * Utility class for generating pseudo-random numbers and vectors with a seed-able random number generator.
 *
 * The reason for making this class was that the SeededRandom library was hard to use directly
 * and to collect all random function in one place.
 *
 * It sets the seed in the constructor, so the random numbers are predictable when writing tests.
 *
 * @remarks
 * This class wraps a seeded random number generator, allowing for reproducible random sequences.
 * It provides methods for generating random numbers, integers, floating-point numbers within a range,
 * random unit vectors, and random points within a bounding box or a specified range.
 */
export class Random {
  private readonly _random = SeededRandom.create();

  constructor(seed: number) {
    this.seed = seed;
  }

  // eslint-disable-next-line accessor-pairs
  public set seed(value: number) {
    // we want only setter on this
    this._random.seed(value.toString()); // For some reason the seed function in the library takes a string
  }

  public random(): number {
    return this._random.random();
  }

  public getInteger(): number {
    return this.getIntegerByMax(Number.MAX_SAFE_INTEGER);
  }

  public getIntegerByMax(exclusiveMax: number): number {
    return Math.floor(this.random() * exclusiveMax);
  }

  public intBetween(min: number, max: number): number {
    return this._random.intBetween(min, max);
  }

  public floatBetween(min: number, max: number): number {
    return this._random.floatBetween(min, max);
  }

  /**
   * Generates a random number following a Gaussian (normal) distribution
   * using the Box-Muller transform.
   *
   * @param mean - The mean (μ) of the distribution. Defaults to 0.
   * @param stdDev - The standard deviation (σ) of the distribution. Defaults to 1.
   * @returns A random number sampled from the specified normal distribution.
   */
  public getGaussian(mean = 0, stdDev = 1): number {
    for (let i = 0; i < 10000; i++) {
      const a = this.random();
      if (a <= Number.EPSILON) {
        continue;
      }
      const b = this.random();
      if (b <= Number.EPSILON) {
        continue;
      }
      const gaussian = Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
      return gaussian * stdDev + mean;
    }
    return mean; // fallback to mean if we fail to get a good random number
  }

  public getColor(): Color {
    return new Color(this.random(), this.random(), this.random());
  }

  public getUnitVector(): Vector3 {
    return new Vector3(this.random(), this.random(), this.random()).normalize();
  }

  public getPointInsideBox(boundingBox: Box3): Vector3 {
    const { min, max } = boundingBox;
    return new Vector3(
      this.floatBetween(min.x, max.x),
      this.floatBetween(min.y, max.y),
      this.floatBetween(min.z, max.z)
    );
  }

  public getPoint(minCoordinate: number, maxCoordinate: number): Vector3 {
    return new Vector3(
      this.floatBetween(minCoordinate, maxCoordinate),
      this.floatBetween(minCoordinate, maxCoordinate),
      this.floatBetween(minCoordinate, maxCoordinate)
    );
  }

  public getPointsInsideBox(count: number, boundingBox: Box3): Vector3[] {
    const points = new Array<Vector3>(count);
    for (let i = 0; i < count; i++) {
      points[i] = this.getPointInsideBox(boundingBox);
    }
    return points;
  }
}
