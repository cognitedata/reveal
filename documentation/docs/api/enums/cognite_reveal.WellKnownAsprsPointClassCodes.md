---
id: "cognite_reveal.WellKnownAsprsPointClassCodes"
title: "Enumeration: WellKnownAsprsPointClassCodes"
sidebar_label: "WellKnownAsprsPointClassCodes"
custom_edit_url: null
---

[@cognite/reveal](../modules/cognite_reveal.md).WellKnownAsprsPointClassCodes

ASPRS well known point class types.

**`see`** [http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf](http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf) (page 30)

## Enumeration Members

### BridgeDeck

• **BridgeDeck**

Note that [WellKnownAsprsPointClassCodes.ReservedOrBridgeDeck](cognite_reveal.WellKnownAsprsPointClassCodes.md#reservedorbridgedeck) has been used
historically.

#### Defined in

[packages/pointclouds/src/types.ts:59](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L59)

___

### Building

• **Building**

#### Defined in

[packages/pointclouds/src/types.ts:24](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L24)

___

### Created

• **Created**

Created, never classified.

#### Defined in

[packages/pointclouds/src/types.ts:18](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L18)

___

### Default

• **Default**

Special value for all other classes. Some point in Potree might be in this class

#### Defined in

[packages/pointclouds/src/types.ts:14](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L14)

___

### Ground

• **Ground**

#### Defined in

[packages/pointclouds/src/types.ts:20](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L20)

___

### HighNoise

• **HighNoise**

High point, or "high noise".
Note that [WellKnownAsprsPointClassCodes.ReservedOrHighPoint](cognite_reveal.WellKnownAsprsPointClassCodes.md#reservedorhighpoint) has been used
historically.

#### Defined in

[packages/pointclouds/src/types.ts:65](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L65)

___

### HighVegetation

• **HighVegetation**

#### Defined in

[packages/pointclouds/src/types.ts:23](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L23)

___

### IgnoredGround

• **IgnoredGround**

E.g. breakline proximity.

#### Defined in

[packages/pointclouds/src/types.ts:73](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L73)

___

### LowPoint

• **LowPoint**

Low point, typically "low noise".

#### Defined in

[packages/pointclouds/src/types.ts:28](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L28)

___

### LowVegetation

• **LowVegetation**

#### Defined in

[packages/pointclouds/src/types.ts:21](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L21)

___

### MedVegetation

• **MedVegetation**

#### Defined in

[packages/pointclouds/src/types.ts:22](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L22)

___

### OverheadStructure

• **OverheadStructure**

E.g. conveyors, mining equipment, traffic lights.

#### Defined in

[packages/pointclouds/src/types.ts:69](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L69)

___

### Rail

• **Rail**

#### Defined in

[packages/pointclouds/src/types.ts:35](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L35)

___

### ReservedOrBridgeDeck

• **ReservedOrBridgeDeck**

In previous revisions of LAS this was "Bridge deck", but in more recent
revisions this value is reserved.

#### Defined in

[packages/pointclouds/src/types.ts:41](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L41)

___

### ReservedOrHighPoint

• **ReservedOrHighPoint**

In previous revisions of LAS this was High point ("high noise"), in more recent
revisions this value is reserved.

#### Defined in

[packages/pointclouds/src/types.ts:33](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L33)

___

### RoadSurface

• **RoadSurface**

#### Defined in

[packages/pointclouds/src/types.ts:36](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L36)

___

### Snow

• **Snow**

#### Defined in

[packages/pointclouds/src/types.ts:74](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L74)

___

### TemporalExclusion

• **TemporalExclusion**

Features excluded due to changes over time between data sources – e.g., water
levels, landslides, permafrost

#### Defined in

[packages/pointclouds/src/types.ts:79](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L79)

___

### TransmissionTower

• **TransmissionTower**

#### Defined in

[packages/pointclouds/src/types.ts:50](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L50)

___

### Unclassified

• **Unclassified**

#### Defined in

[packages/pointclouds/src/types.ts:19](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L19)

___

### UserDefinableOffset

• **UserDefinableOffset**

First user definable class identifier (64).
Values up to and including 63 are reserved

#### Defined in

[packages/pointclouds/src/types.ts:85](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L85)

___

### Water

• **Water**

#### Defined in

[packages/pointclouds/src/types.ts:34](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L34)

___

### WireConductor

• **WireConductor**

Wire conductor (phase).

#### Defined in

[packages/pointclouds/src/types.ts:49](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L49)

___

### WireGuard

• **WireGuard**

Wire guard shield.

#### Defined in

[packages/pointclouds/src/types.ts:45](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L45)

___

### WireStructureConnector

• **WireStructureConnector**

Wire-structure connector (e.g. insulator).

#### Defined in

[packages/pointclouds/src/types.ts:54](https://github.com/cognitedata/reveal/blob/716e7443e/viewer/packages/pointclouds/src/types.ts#L54)
