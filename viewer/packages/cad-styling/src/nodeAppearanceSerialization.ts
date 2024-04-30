/*!
 * Copyright 2022 Cognite AS
 */

import { NodeAppearance, SerializableNodeAppearance } from './NodeAppearance';

import { Color } from 'three';

function serializableColorToThreeColor(color?: [number, number, number]): Color | undefined {
  if (!color) return undefined;
  return new Color().fromArray(color.map(c => c / 255));
}

function threeColorToSerializable(color?: Color): [number, number, number] | undefined {
  if (!color) return undefined;
  return color.toArray().map(c => Math.round(c * 255)) as [number, number, number];
}

export function fromSerializableNodeAppearance(appearance: SerializableNodeAppearance): NodeAppearance {
  return { ...appearance, color: serializableColorToThreeColor(appearance.color) };
}

export function toSerializableNodeAppearance(appearance: NodeAppearance): SerializableNodeAppearance {
  return { ...appearance, color: threeColorToSerializable(appearance.color) };
}
