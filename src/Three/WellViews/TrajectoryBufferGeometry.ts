import * as THREE from "three";

import { Vector3 } from "@/Core/Geometry/Vector3";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";



export class TrajectoryBufferGeometry extends THREE.BufferGeometry
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================
  private radialSegments: number;
  private radius: number;


  private vertices: number[] = [];
  private normals: number[] = [];
  private uvs: number[] = [];
  private indices: number[] = [];

  // Temp vectors for speed
  private pseudoNormal: Vector3 = Vector3.newZero;
  private normal: Vector3 = Vector3.newZero;
  private n = Vector3.newZero;
  private b = Vector3.newZero;

  //==================================================
  // CONSTRUCTORS
  //==================================================


  public constructor(trajectory: WellTrajectory, radius: number, radialSegments: number)
  {
    super();
    this.radialSegments = radialSegments;
    this.radius = radius;

    this.generateBufferData(trajectory);

    this.setIndex(this.indices);
    this.addAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
    this.addAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    this.addAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));
  }

  //==================================================
  // INSTANCE FUNCTIONS: Generate the data
  //==================================================

  private generateBufferData(trajectory: WellTrajectory)
  {
    const difference = Vector3.substract(trajectory.getPointAt(0), trajectory.getPointAt(trajectory.count - 1));
    this.pseudoNormal = new Vector3(0, 0, 0);
    const dimension = difference.absMinDimension;

    this.pseudoNormal.setAt(dimension, 1);

    this.generateSamples(trajectory);
    this.generateUVs(trajectory);
  }

  private generateSamples(trajectory: WellTrajectory)
  {
    // Initialize for the first point
    let prevPoint = trajectory.getPointAt(0);
    let currPoint = prevPoint;
    let nextPoint = trajectory.getPointAt(1);

    const tangent = Vector3.newEmpty;
    const maxIndex = trajectory.count - 1;


    let radius = 5;
    let k = 0;
    for (let i = 0; i <= maxIndex; i++)
    {
      tangent.copyFrom(prevPoint);
      tangent.substract(nextPoint);

      if (i === 0)
      {
        this.generateSample(currPoint, tangent, 0, 1);
        this.generateSample(currPoint, tangent, radius, 1);
        this.generateIndices(k++);
        this.generateSample(currPoint, tangent, radius);
      }
      else if (i === maxIndex)
      {
        this.generateSample(currPoint, tangent, radius);
        this.generateIndices(k++);
        this.generateSample(currPoint, tangent, radius, -1);
        this.generateSample(currPoint, tangent, 0, -1);
        this.generateIndices(k++);
      }
      else if (i === 10 || i === 30)
      {
        this.generateSample(currPoint, tangent, radius);
        this.generateIndices(k++);

        this.generateSample(currPoint, tangent, radius, 1);
        radius *= 2;
        this.generateSample(currPoint, tangent, radius, 1);
        this.generateIndices(k++);

        this.generateSample(currPoint, tangent, radius);
      }
      else if (i === 20 || i === 40)
      {
        this.generateSample(currPoint, tangent, radius);
        this.generateIndices(k++);

        this.generateSample(currPoint, tangent, radius, -1);
        radius /= 2;
        this.generateSample(currPoint, tangent, radius, -1);
        this.generateIndices(k++);

        this.generateSample(currPoint, tangent, radius);
      }
      else
      {
        this.generateSample(currPoint, tangent, radius);
        this.generateIndices(k++);
      }

      // Initialize for the next point
      prevPoint = currPoint;
      currPoint = nextPoint;
      if (i < maxIndex)
        nextPoint = trajectory.getPointAt(i + 1);
    }
  }

  private generateSample(point: Vector3, tangent: Vector3, radius: number, horizontal: number = 0)
  {
    this.n.copyFrom(this.pseudoNormal);
    this.n.crossProduct(tangent);
    this.n.normalize();

    this.b.copyFrom(this.n);
    this.b.crossProduct(tangent);
    this.b.normalize();

    if (horizontal)
      tangent.normalize();

    for (let j = 0; j <= this.radialSegments; j++)
    {
      const v = j / this.radialSegments * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = - Math.cos(v);

      // normal
      this.normal.x = (cos * this.n.x + sin * this.b.x);
      this.normal.y = (cos * this.n.y + sin * this.b.y);
      this.normal.z = (cos * this.n.z + sin * this.b.z);
      this.normal.normalize();

      if (horizontal === 1)
        this.normals.push(tangent.x, tangent.y, tangent.z);
      else if (horizontal === -1)
        this.normals.push(-tangent.x, -tangent.y, -tangent.z);
      else
        this.normals.push(this.normal.x, this.normal.y, this.normal.z);

      // vertex
      const x = point.x + radius * this.normal.x;
      const y = point.y + radius * this.normal.y;
      const z = point.z + radius * this.normal.z;
      this.vertices.push(x, y, z);
    }
  }

  private generateIndices(j: number): void
  {
    const s = this.radialSegments + 1;
    for (let i = 1; i <= this.radialSegments; i++)
    {
      const a = s * (j - 1) + (i - 1);
      const b = s * j + (i - 1);
      const c = s * j + i;
      const d = s * (j - 1) + i;

      this.indices.push(a, b, d);
      this.indices.push(b, c, d);
    }
  }

  private generateUVs(trajectory: WellTrajectory): void
  {
    const range = trajectory.mdRange;
    for (let i = 0; i < trajectory.count; i++)
    {
      const uv = range.getFraction(trajectory.samples[i].md);
      for (let j = 0; j <= this.radialSegments; j++)
        this.uvs.push(uv, 1);
    }
  }
}

