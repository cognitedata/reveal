import { Matrix4, Vector3 } from 'three';
import { getTranslationRotationMatrix, type Cylinder } from './Cylinder';
import { Range1 } from '../geometry/Range1';
import { LeastSquare } from './LeastSquare';
import { Vector3ArrayUtils } from '../primitives/Vector3ArrayUtils';
import { horizontalLength } from '../extensions/vectorUtils';
import { bestFitVerticalCylinder } from './bestFitVerticalCylinder';

export const MAIN_AXISES = createMainAxis();

type AcceptCylinder = (cylinder: Cylinder) => boolean;

/**
 * Computes the best-fit cylinder for a given set of 3D points.
 *
 * Iterates through a set of main axes, attempting to fit a cylinder to the points
 * for each axis, and returns the cylinder with the lowest root mean square (RMS) error.
 * Optionally, an acceptance function can be provided to filter out cylinders that do not meet certain criteria.
 *
 * @param points - An array of `Vector3` points representing the 3D coordinates to fit the cylinder to.
 * @param accept - (Optional) A predicate function that takes a `Cylinder` and returns `true` if the cylinder is acceptable.
 * @returns The best-fit `Cylinder` object with the lowest RMS error, or `undefined` if no suitable cylinder is found.
 */
export function bestFitCylinder(points: Vector3[], accept?: AcceptCylinder): Cylinder | undefined {
  const massCenter = Vector3ArrayUtils.getCenterOfMass(points);
  if (massCenter === undefined) {
    return undefined;
  }
  let bestCylinder: Cylinder | undefined;

  // Try with all available axis as a starting point, and keep the best one
  for (const axis of MAIN_AXISES) {
    const cylinder = getCylinderByInitialAxis(points, axis, massCenter);
    if (cylinder === undefined) {
      continue;
    }
    // Calculate the Root mean square error
    cylinder.rms = getRms(points, cylinder);
    if (accept !== undefined && !accept(cylinder)) {
      continue;
    }
    if (bestCylinder !== undefined && cylinder.rms >= bestCylinder.rms) {
      continue;
    }
    bestCylinder = cylinder;
  }
  return bestCylinder;
}

function getCylinderByInitialAxis(
  points: Vector3[],
  axis: Vector3,
  massCenter: Vector3
): Cylinder | undefined {
  const matrix = getTranslationRotationMatrix(axis, massCenter);
  const invMatrix = matrix.clone().invert();

  const cylinder = bestFitVerticalCylinder(points, invMatrix);
  if (cylinder === undefined) {
    return undefined;
  }
  // Transform the cylinder back to original space
  cylinder.axis.copy(axis);
  cylinder.center.applyMatrix4(matrix);

  // Find a better solution, keep the old one if failed
  if (!computeGaussNewton(points, cylinder)) {
    return cylinder;
  }
  updateHeightAndCenter(cylinder, points);
  return cylinder;
}

function updateHeightAndCenter(cylinder: Cylinder, points: Vector3[]): void {
  const matrix = cylinder.getTranslationRotationMatrix();
  const invMatrix = matrix.clone().invert();
  const zRange = new Range1();
  for (const point of points) {
    const transformed = point.clone().applyMatrix4(invMatrix);
    zRange.add(transformed.z);
  }
  cylinder.height = zRange.delta;
  cylinder.center.set(0, 0, zRange.center);
  cylinder.center.applyMatrix4(matrix);
}

function computeGaussNewton(points: Vector3[], cylinder: Cylinder): boolean {
  // Gauss-Newton algorithm:
  //
  // Min S(X) = Sum(Residual_i(X))
  // Where J_ij = dResidual_i(X)/dX_j (jacobian)
  //
  // Update:
  // X(i+1) = X(i) - (J*Jt)^(-1) * (Jt * Residual)
  //
  // Written in the form A*X = B
  // -(J*Jt) * (X(i+1) - X(i)) = (Jt * Residual)
  // -(J*Jt)*dX = (Jt * R)

  // (A,B,C) axis vector
  // (X0,Y0,Z0) point on axis
  //
  // The distance from a point to the cylinder is given by
  // Di = Ri - R
  //
  // ObjectiveFunction = Sum(Di^2) ~ Sum(Ri*Ri-R*R)  Ri is distance from a point to the axis
  // ObjectiveFunction = F(X0, Y0, Z0, A, B, C, R)

  // Ri = Sqrt(Ui*Ui + Vi*Vi + WiWi)/Sqrt(A*A+B*B+C*C)    and Sqrt(A*A+B*B+C*C) = 1
  // Ui = C*(Yi - Y0) - B*(Zi - Z0)
  // Vi = A*(Zi - Z0) - C*(Xi - X0)
  // Wi = B*(Xi - X0) - A*(Yi - Y0)

  // When
  // (A,B,C) = (0,0,1)
  // (X0,Y0,Z0) = (0,0,0)
  //
  // Ri = Sqrt( (Xi)^2 + (Yi)^2)
  // dDi/dX0 = dRi/dX0 = 1/(2*Ri) * (-2*Xi) = -Xi/Ri
  // dDi/dY0 = dRi/dY0 = 1/(2*Ri) * (-2*Yi) = -Yi/Ri
  //
  // dDi/dA:
  // Ui = Yi
  // Vi = A*Zi - Xi
  // Wi = -A*Yi

  // dDi/dA = dRi/dA = 1/(2Ri)*d(Ui*Ui + Vi*Vi + WiWi)/dA =
  // d(Ui*Ui + Vi*Vi + WiWi)/dA = 2Ui*dUi/dA + 2Vi*dVi/dA + 2Wi*dWi/dA =
  // 2(0 + (A*Zi - Xi)*Zi + (- A*Yi)Yi) = -2Xi*Zi when A = 0
  // dDi/dA = (-2Xi*Zi)/(2Ri) = -Xi*Zi

  // dD/dX0 = -Xi/Ri
  // dD/dY0 = -Yi/Ri
  // dD/dZ0 = 0
  // dD/dA = -Xi*Zi/Ri
  // dD/dB = -Yi*Xi/Ri
  // dD/dC = 0
  // dD/dR = -1

  // Jacobian:
  //    dD/dX0    dD/dY0    dD/dA         dD/dB      dD/dR
  // | -X_0/R_0  -Y_0/R_0  -X_0*Z_0/R_0  -Y_0*Z_0/R_0  -1 |   | X0 |    | D_0 |
  // | -X_1/R_1  -Y_1/R_1  -X_1*Z_1/R_1  -Y_1*Z_1/R_1  -1 |   | Y0 |    | D_1 |
  // | -X_2/R_2  -Y_2/R_2  -X_2*Z_2/R_2  -Y_2*Z_2/R_2  -1 |   | A  |    | D_2 |
  // | -X_3/R_3  -Y_3/R_3  -X_3*Z_3/R_3  -Y_3*Z_3/R_3  -1 |   | B  | =  | D_3 |
  // | -X_4/R_4  -Y_4/R_4  -X_4*Z_4/R_4  -Y_4*Z_4/R_4  -1 |   | R  |    | D_4 |

  // Z0 = -P1*P3 - P2*P4

  const axis = cylinder.axis.clone();
  const center = cylinder.center.clone();
  let radius = cylinder.radius;

  const maxIterationCount = points.length < 100 ? 30 : 10;
  const minIterationCount = points.length < 100 ? 5 : 3;
  const normalEquation = new LeastSquare(5);
  const leftHandSide = new Array<number>(5); // Uses as temp array to avoid creating many arrays
  let firstRms = 0;

  for (let iterationCount = 0; ; iterationCount++) {
    const matrix = getTranslationRotationMatrix(axis, center);
    matrix.multiply(new Matrix4().makeScale(radius, radius, radius));

    if (Math.abs(matrix.determinant()) < 1e-12) {
      return false;
    }
    normalEquation.clear();
    let sumErrorSquared = 0;

    try {
      const invMatrix = matrix.clone().invert();
      for (const point of points) {
        const transformed = point.clone().applyMatrix4(invMatrix);
        const distanceToCenter = horizontalLength(transformed);
        const error = 1 - distanceToCenter;

        leftHandSide[0] = -transformed.x / distanceToCenter; // dD/dX0
        leftHandSide[1] = -transformed.y / distanceToCenter; // dD/dY0
        leftHandSide[2] = (-transformed.x * transformed.z) / distanceToCenter; // dD/dA
        leftHandSide[3] = (-transformed.y * transformed.z) / distanceToCenter; // dD/dB
        leftHandSide[4] = -1; // dD/dR

        normalEquation.addEquation(leftHandSide, error);
        sumErrorSquared += error * error;
      }
    } catch {
      return false;
    }

    const rms = Math.sqrt(sumErrorSquared / points.length);
    if (iterationCount === 0) {
      firstRms = rms;
    } else if (rms > 20 * firstRms) {
      return false; // Diverging, give up
    }
    const x = normalEquation.compute();
    if (x === undefined) {
      if (iterationCount === 0) {
        return false; // No solution found at the first attempt
      }
      if (rms > firstRms) {
        return false; // No solution found and worse than the first attempt
      }
      break; // Use the solution in previous iteration
    }
    axis.set(x[2], x[3], 1);
    axis.normalize();
    axis.transformDirection(matrix);
    if (axis.z < 0) {
      axis.negate();
    }
    // Line given by A*x + B*y + C*z = 0;
    // When we set C = 1, z = -A*x - B*y
    const deltaCenter = new Vector3(x[0], x[1], -x[0] * x[2] - x[1] * x[3]);

    // transformDirection is actually also scaling with the length of the vector, so we must
    // compensate for that here
    const length = deltaCenter.length();
    deltaCenter.transformDirection(matrix);
    center.addScaledVector(deltaCenter, length);

    radius += radius * x[4];

    // Check for convergence, the sum of squared changes is small, then we are done
    const sumSquared = getSumSquared(x);
    if (sumSquared < 0.0001 && iterationCount >= minIterationCount) {
      break; // Better solution is found
    }
    if (iterationCount >= maxIterationCount) {
      if (rms > firstRms) {
        return false; // No solution found and worse than the first attempt
      }
      break; // Solution is found
    }
  }
  if (radius <= 0) {
    return false; // Should be impossible, but you never know...
  }
  cylinder.axis.copy(axis);
  cylinder.center.copy(center);
  cylinder.radius = radius;
  return true;
}

function getRms(points: Vector3[], cylinder: Cylinder): number {
  const matrix = cylinder.getTranslationRotationMatrix();
  const invMatrix = matrix.clone().invert();
  let sumError = 0;
  for (const point of points) {
    const transformed = point.clone().applyMatrix4(invMatrix);
    // Find relative radius error
    const radius = horizontalLength(transformed);
    const error = 1 - radius / cylinder.radius;
    sumError += error * error;
  }
  return Math.sqrt(sumError / points.length);
}

function getSumSquared(values: number[]): number {
  let sumSquared = 0;
  for (const value of values) {
    sumSquared += value * value;
  }
  return sumSquared;
}

function createMainAxis(): Vector3[] {
  const axises = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1),
    new Vector3(1, 1, 0),
    new Vector3(1, -1, 0),
    new Vector3(0, 1, 1),
    new Vector3(0, -1, 1),
    new Vector3(1, 0, 1),
    new Vector3(-1, 0, 1),
    new Vector3(1, 1, 1),
    new Vector3(-1, 1, 1),
    new Vector3(1, -1, 1),
    new Vector3(-1, -1, 1)
  ];
  for (const axis of axises) {
    axis.normalize();
    if (axis.z < 0) {
      axis.negate();
    }
  }
  return axises;
}
