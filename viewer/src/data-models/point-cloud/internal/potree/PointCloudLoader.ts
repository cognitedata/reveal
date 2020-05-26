/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
// @ts-ignore
import * as Potree from '@cognite/potree-core';

type PotreeBoundingBox = {
  lx: number;
  ly: number;
  lz: number;
  ux: number;
  uy: number;
  uz: number;
};

type PotreeMetadata = {
  version: string;
  octreeDir: string;
  spacing: number;
  hierarchyStepSize: number;
  pointAttributes: string;
  scale: number;
  boundingBox: PotreeBoundingBox;
  tightBoundingBox?: PotreeBoundingBox;
};

/**
 * Adaptation of `Potree.POCLoader` to allow better control of how point clouds are loaded.
 */
export class PointCloudLoader {
  static async load(url: string): Promise<Potree.PointCloudOctreeGeometry> {
    const pco = new Potree.PointCloudOctreeGeometry();
    pco.url = url;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load point clouds: Server responded with ${response.status} '${response.statusText}'`);
    }

    const data: PotreeMetadata = await response.json();
    const version = new Potree.VersionUtils(data.version);
    if (version.upTo('1.6')) {
      throw new Error(`Only point clouds with version 1.7 or newer is supported (got ${version})`);
    }

    // Assume octreeDir is absolute if it starts with http
    if (data.octreeDir.indexOf('http') === 0) {
      pco.octreeDir = data.octreeDir;
    } else {
      pco.octreeDir = url + '/../' + data.octreeDir;
    }
    pco.spacing = data.spacing;
    pco.hierarchyStepSize = data.hierarchyStepSize;
    pco.pointAttributes = data.pointAttributes;

    const min = new THREE.Vector3(data.boundingBox.lx, data.boundingBox.ly, data.boundingBox.lz);
    const max = new THREE.Vector3(data.boundingBox.ux, data.boundingBox.uy, data.boundingBox.uz);
    const boundingBox = new THREE.Box3(min, max);
    const tightBoundingBox = boundingBox.clone();

    if (data.tightBoundingBox) {
      tightBoundingBox.min.copy(
        new THREE.Vector3(data.tightBoundingBox.lx, data.tightBoundingBox.ly, data.tightBoundingBox.lz)
      );
      tightBoundingBox.max.copy(
        new THREE.Vector3(data.tightBoundingBox.ux, data.tightBoundingBox.uy, data.tightBoundingBox.uz)
      );
    }

    const offset = min.clone();

    boundingBox.min.sub(offset);
    boundingBox.max.sub(offset);

    tightBoundingBox.min.sub(offset);
    tightBoundingBox.max.sub(offset);

    pco.boundingBox = boundingBox;
    pco.tightBoundingBox = tightBoundingBox;
    pco.boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
    pco.tightBoundingSphere = tightBoundingBox.getBoundingSphere(new THREE.Sphere());
    pco.offset = offset;

    // Select the appropiate loader
    if (data.pointAttributes === 'LAS' || data.pointAttributes === 'LAZ') {
      pco.loader = new Potree.LasLazLoader(data.version);
    } else {
      pco.loader = new Potree.BinaryLoader(data.version, boundingBox, data.scale);
      pco.pointAttributes = new Potree.PointAttributes(pco.pointAttributes);
    }

    const nodes: { [name: string]: Potree.PointCloudOctreeGeometryNode } = {};

    const rootName = 'r';
    const root = new Potree.PointCloudOctreeGeometryNode(rootName, pco, boundingBox);
    root.level = 0;
    root.hasChildren = true;
    root.spacing = pco.spacing;
    root.numPoints = 0; // Not present in version 1.7+

    pco.root = root;
    pco.root.load();
    nodes.r = root;
    pco.nodes = nodes;

    return pco;
  }
}
