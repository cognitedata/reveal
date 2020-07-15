import * as THREE from "three";
import * as Color from "color"

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Range1 } from "@/Core/Geometry/Range1";
import { RenderSample } from "@/SubSurface/Wells/Samples/RenderSample";

export class TrajectoryBufferGeometry extends THREE.BufferGeometry
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  // Geometrical properties
  private radialSegments: number;

  // Buffers to be filled up
  private vertices: number[] = [];
  private normals: number[] = [];
  private indices: number[] = [];
  private colors: number[] = [];
  private uvs: number[] = [];

  private sampleIndex = 0;

  // Temp vectors for speed
  private pseudoNormal = Vector3.newZero;
  private normal = Vector3.newZero;
  private n = Vector3.newZero;
  private b = Vector3.newZero;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(samples: RenderSample[], radialSegments = 16)
  {
    super();
    this.radialSegments = radialSegments;

    const difference = Vector3.substract(samples[0].point, samples[samples.length - 1].point);

    if (samples.length < 2)
      return;

    // Calculate the pseudo normal
    this.pseudoNormal = new Vector3(0, 0, 0);
    const dimension = difference.absMinDimension;
    this.pseudoNormal.setAt(dimension, 1);

    this.generateBufferData(samples);
    this.generateUVs(samples);

    this.setIndex(this.indices);
    this.addAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
    this.addAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    this.addAttribute("color", new THREE.Uint8BufferAttribute(this.colors, 3, true));
  }

  //==================================================
  // INSTANCE METHODS: Generate the data
  //==================================================

  private generateBufferData(samples: RenderSample[])
  {
    let prevSample = samples[0];
    let currSample = prevSample;

    const tangent = Vector3.newEmpty;
    const maxIndex = samples.length - 1;

    for (let i = 0; i <= maxIndex; i++)
    {
      const nextSample = i < maxIndex ? samples[i + 1] : currSample;

      tangent.copy(prevSample.point);
      tangent.substract(nextSample.point);

      if (currSample.isEmpty && prevSample.isEmpty)
        continue;

      if (currSample.isEmpty)
      {
        // End the previous and add base cap
        this.addSegment(currSample.point, prevSample.radius, prevSample.color, tangent, true);
        this.addBaseCap(currSample, tangent, prevSample);
      }
      else if (i === 0 || prevSample.isEmpty)
      {
        // Add a top cap and start sampling
        this.addTopCap(currSample, tangent);
        this.addSample(currSample, tangent);
      }
      else if (i === maxIndex)
      {
        // End sampling and add a base cap
        this.addSample(currSample, tangent, true);
        this.addBaseCap(currSample, tangent);
      }
      else if (!currSample.isEqualColorAndRadius(prevSample))
      {
        // End sampling, add radius shift and start sampling
        this.addSegment(currSample.point, prevSample.radius, prevSample.color, tangent, true);
        this.addRadiusShift(prevSample, currSample, tangent);
        this.addSample(currSample, tangent);
      }
      else
        // Continue sampling
        this.addSample(currSample, tangent, true);

      // Initialize for the next point
      prevSample = currSample;
      currSample = nextSample;
    }
  }

  private addTopCap(sample: RenderSample, tangent: Vector3)
  {
    const normalDirection = 1;
    this.addSegment(sample.point, 0, sample.color, tangent, false, normalDirection);
    this.addSample(sample, tangent, true, normalDirection);
  }

  private addBaseCap(sample: RenderSample, tangent: Vector3, prevSample: RenderSample | null = null)
  {
    const normalDirection = -1;
    if (!prevSample)
      this.addSample(sample, tangent, false, normalDirection);
    else
      this.addSegment(sample.point, prevSample.radius, prevSample.color, tangent, false, normalDirection);
    this.addSegment(sample.point, 0, sample.color, tangent, true, normalDirection);
  }

  private addRadiusShift(prevSample: RenderSample, sample: RenderSample, tangent: Vector3)
  {
    const normalDirection = prevSample.radius < sample.radius ? 1 : -1;
    const color = normalDirection > 0 ? sample.color : prevSample.color;
    this.addSegment(sample.point, prevSample.radius, color, tangent, false, normalDirection);
    this.addSegment(sample.point, sample.radius, color, tangent, true, normalDirection);
  }

  private addSample(sample: RenderSample, tangent: Vector3, generateIndices = false, normalDirection = 0)
  {
    this.addSegment(sample.point, sample.radius, sample.color, tangent, generateIndices, normalDirection);
  }

  private addSegment(point: Vector3, radius: number, color: Color, tangent: Vector3, generateIndices = false, normalDirection = 0)
  {
    this.sampleIndex++;
    this.n.copy(this.pseudoNormal);
    this.n.crossProduct(tangent);
    this.n.normalize();

    this.b.copy(this.n);
    this.b.crossProduct(tangent);
    this.b.normalize();

    // normalDirection: -1 -tangent, 0: normal, 1: +tangent
    if (normalDirection)
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

      if (normalDirection === 1)
        this.normals.push(tangent.x, tangent.y, tangent.z);
      else if (normalDirection === -1)
        this.normals.push(-tangent.x, -tangent.y, -tangent.z);
      else
        this.normals.push(this.normal.x, this.normal.y, this.normal.z);

      // vertex
      const x = point.x + radius * this.normal.x;
      const y = point.y + radius * this.normal.y;
      const z = point.z + radius * this.normal.z;

      this.vertices.push(x, y, z);
      this.colors.push(color.red(), color.green(), color.blue());
    }
    if (generateIndices)
      this.generateIndices();
  }

  private generateIndices(): void
  {
    const j1 = this.sampleIndex - 1;
    const j0 = this.sampleIndex - 2;
    const s = this.radialSegments + 1;

    for (let i0 = 0; i0 < this.radialSegments; i0++)
    {
      const i1 = i0 + 1;
      const a = s * j0 + i0;
      const b = s * j1 + i0;
      const c = s * j1 + i1;
      const d = s * j0 + i1;

      this.indices.push(a, b, d);
      this.indices.push(b, c, d);
    }
  }

  private generateUVs(samples: RenderSample[]): void
  {
    const range = new Range1(samples[0].md, samples[samples.length - 1].md);
    for (let i = 0; i < samples.length; i++)
    {
      const uv = range.getFraction(samples[i].md);
      for (let j = 0; j <= this.radialSegments; j++)
        this.uvs.push(uv, 1);
    }
  }
}
