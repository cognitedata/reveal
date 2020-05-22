import * as THREE from "three";
import * as Color from "color"

import { Colors } from "@/Core/Primitives/Colors";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { RenderSample } from "@/Nodes/Wells/Samples/RenderSample";

export class TrajectoryBufferGeometry extends THREE.BufferGeometry
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  // Geometrical properties
  private radialSegments: number;
  private defaultRadius: number;

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

  public constructor(trajectory: WellTrajectory, radius: number, radialSegments: number)
  {
    super();
    this.radialSegments = radialSegments;
    this.defaultRadius = radius;

    this.generateBufferData(trajectory);
    this.setIndex(this.indices);
    this.addAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
    this.addAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    this.addAttribute("color", new THREE.Uint8BufferAttribute(this.colors, 4, true));

    // this.addAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));
  }

  //==================================================
  // INSTANCE FUNCTIONS: Generate the data
  //==================================================

  private generateBufferData(trajectory: WellTrajectory)
  {
    const difference = Vector3.substract(trajectory.getPointAt(0), trajectory.getPointAt(trajectory.count - 1));

    // Calculate the pseudo normal
    this.pseudoNormal = new Vector3(0, 0, 0);
    const dimension = difference.absMinDimension;
    this.pseudoNormal.setAt(dimension, 1);

    this.generateSamples(trajectory);
    // this.generateUVs(trajectory);
  }


  private generateSamples(trajectory: WellTrajectory)
  {
    // Initialize for the first point
    const samples = trajectory.createRenderSamples(Colors.lightGrey, this.defaultRadius);

    console.log(trajectory.mdRange);
    trajectory.touch();
    console.log(trajectory.mdRange);
    const md = trajectory.mdRange.min + 1;
    samples.push(new RenderSample(trajectory.getAtMd(md), md));
    samples.sort(RenderSample.compareMd);


    console.log(trajectory.getPointAt(0));
    console.log(trajectory.getPointAt(1));
    console.log(trajectory.getAtMd(md));
    console.log(md);
    console.log("-----");

    const i0 = Math.round(0.3 * samples.length);
    const i1 = Math.round(0.6 * samples.length);
    const i2 = Math.round(0.8 * samples.length);

    for (let i = 0; i < 2; i++)
    {
      samples[i].color = Colors.grey;
      samples[i].radius = 20;
    }
    for (let i = 2; i < i0; i++)
    {
      samples[i].color = Colors.grey;
      samples[i].radius = 15;
    }
    for (let i = i0; i < i1; i++)
    {
      samples[i].color = Colors.blue;
      samples[i].radius = 10;
    }
    for (let i = i1; i < i2; i++)
    {
      samples[i].color = Colors.red;
      samples[i].radius = 5;
    }
    let prevSample = samples[0];
    let currSample = prevSample;
    let nextSample = samples[1];

    const tangent = Vector3.newEmpty;
    const maxIndex = samples.length - 1;
    for (let i = 0; i <= maxIndex; i++)
    {
      tangent.copyFrom(prevSample.point);
      tangent.substract(nextSample.point);

      if (i === 0)
      {
        this.addTop(currSample, tangent);
        this.addSample(currSample, tangent);
      }
      else if (i === maxIndex)
      {
        this.addSample(currSample, tangent, true);
        this.addBase(currSample, tangent);
      }
      else if (!currSample.isEqualColorAndRadius(prevSample))
      {
        this.addSegment(currSample.point, prevSample.radius, prevSample.color, tangent, true);
        this.addRadiusShift(prevSample, currSample, tangent);
        this.addSample(currSample, tangent);
      }
      else
        this.addSample(currSample, tangent, true);

      // Initialize for the next point
      prevSample = currSample;
      currSample = nextSample;
      if (i < maxIndex)
        nextSample = samples[i + 1];
    }
  }

  private addTop(sample: RenderSample, tangent: Vector3) 
  {
    const normalDirection = 1;
    this.addSegment(sample.point, 0, sample.color, tangent, false, normalDirection);
    this.addSample(sample, tangent, true, normalDirection);
  }

  private addBase(sample: RenderSample, tangent: Vector3)
  {
    const normalDirection = -1;
    this.addSample(sample, tangent, false, normalDirection);
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
    this.n.copyFrom(this.pseudoNormal);
    this.n.crossProduct(tangent);
    this.n.normalize();

    this.b.copyFrom(this.n);
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
      this.colors.push(color.red(), color.green(), color.blue(), color.alpha());
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
