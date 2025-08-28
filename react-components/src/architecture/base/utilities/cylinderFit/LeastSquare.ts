import { Matrix, solve } from 'ml-matrix';

export class LeastSquare {
  private _sampleCount: number = 0;

  // These are aTa*x = aTb in the normal equation system for least square problems
  // where aT is the transpose of the N x N matrix a, b is the right hand side vector and x is the solution vector
  private readonly _aTa: Matrix;
  private readonly _aTb: number[];

  public constructor(unknownCount: number) {
    this._aTa = new Matrix(unknownCount, unknownCount);
    this._aTb = new Array(unknownCount);
    this.clear();
  }

  public clear(): void {
    this._sampleCount = 0;
    this._aTa.fill(0);
    this._aTb.fill(0);
  }

  /**
   * Computes the least squares solution for the current data.
   *
   * @returns An array of numbers representing the solution vector if the computation is successful
   * and there are enough samples otherwise, returns `undefined`.
   *
   * The method first checks if the number of samples is sufficient to solve the system.
   * It then attempts to solve the symmetric linear system using the stored matrices.
   * If the computation fails (e.g., due to a singular matrix), it returns `undefined`.
   */
  public compute(): number[] | undefined {
    if (this._sampleCount < this._aTa.rows) {
      return undefined;
    }
    try {
      makeSymmetric(this._aTa);
      const solution = solve(this._aTa, Matrix.columnVector(this._aTb), false);
      return solution.to1DArray();
    } catch {
      return undefined;
    }
  }

  /**
   * Adds a new equation to the least squares system by updating the internal matrix.
   * @param leftHandSide - An array of coefficients representing the left-hand side of the equation.
   * @param rightHandSide - The constant value on the right-hand side of the equation.
   */
  public addEquation(leftHandSide: number[], rightHandSide: number): void {
    this._sampleCount++;

    const n = this._aTa.rows;

    // Only fill out the lower triangle in the matrix
    for (let j = 0; j < n; j++) {
      const a = leftHandSide[j];
      for (let i = j; i < n; i++) {
        this._aTa.set(i, j, this._aTa.get(i, j) + a * leftHandSide[i]);
      }
    }
    for (let i = 0; i < n; i++) {
      this._aTb[i] += rightHandSide * leftHandSide[i];
    }
  }
}

/**
 * Modifies the given square matrix to be symmetric by copying the lower triangle values
 * to the corresponding upper triangle positions.
 *
 * @param matrix - The square matrix to be made symmetric. The matrix is modified in place.
 * @throws {Error} If the provided matrix is not square (quadratic).
 */
function makeSymmetric(matrix: Matrix): void {
  for (let row = 1; row < matrix.rows; row++) {
    for (let col = 0; col < row; col++) {
      matrix.set(col, row, matrix.get(row, col));
    }
  }
}
