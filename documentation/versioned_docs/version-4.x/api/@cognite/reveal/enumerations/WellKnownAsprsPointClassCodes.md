# Enumeration: WellKnownAsprsPointClassCodes

ASPRS well known point class types.

## See

[http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf](http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf) (page 30)

## Enumeration Members

### BridgeDeck

> **BridgeDeck**: `17`

Note that [WellKnownAsprsPointClassCodes.ReservedOrBridgeDeck](WellKnownAsprsPointClassCodes.md#reservedorbridgedeck) has been used
historically.

#### Defined in

[packages/pointclouds/src/types.ts:59](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L59)

***

### Building

> **Building**: `6`

#### Defined in

[packages/pointclouds/src/types.ts:24](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L24)

***

### Created

> **Created**: `0`

Created, never classified.

#### Defined in

[packages/pointclouds/src/types.ts:18](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L18)

***

### Default

> **Default**: `-1`

Special value for all other classes. Some point in Potree might be in this class

#### Defined in

[packages/pointclouds/src/types.ts:14](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L14)

***

### Ground

> **Ground**: `2`

#### Defined in

[packages/pointclouds/src/types.ts:20](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L20)

***

### HighNoise

> **HighNoise**: `18`

High point, or "high noise".
Note that [WellKnownAsprsPointClassCodes.ReservedOrHighPoint](WellKnownAsprsPointClassCodes.md#reservedorhighpoint) has been used
historically.

#### Defined in

[packages/pointclouds/src/types.ts:65](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L65)

***

### HighVegetation

> **HighVegetation**: `5`

#### Defined in

[packages/pointclouds/src/types.ts:23](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L23)

***

### IgnoredGround

> **IgnoredGround**: `20`

E.g. breakline proximity.

#### Defined in

[packages/pointclouds/src/types.ts:73](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L73)

***

### LowPoint

> **LowPoint**: `7`

Low point, typically "low noise".

#### Defined in

[packages/pointclouds/src/types.ts:28](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L28)

***

### LowVegetation

> **LowVegetation**: `3`

#### Defined in

[packages/pointclouds/src/types.ts:21](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L21)

***

### MedVegetation

> **MedVegetation**: `4`

#### Defined in

[packages/pointclouds/src/types.ts:22](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L22)

***

### OverheadStructure

> **OverheadStructure**: `19`

E.g. conveyors, mining equipment, traffic lights.

#### Defined in

[packages/pointclouds/src/types.ts:69](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L69)

***

### Rail

> **Rail**: `10`

#### Defined in

[packages/pointclouds/src/types.ts:35](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L35)

***

### ReservedOrBridgeDeck

> **ReservedOrBridgeDeck**: `12`

In previous revisions of LAS this was "Bridge deck", but in more recent
revisions this value is reserved.

#### Defined in

[packages/pointclouds/src/types.ts:41](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L41)

***

### ReservedOrHighPoint

> **ReservedOrHighPoint**: `8`

In previous revisions of LAS this was High point ("high noise"), in more recent
revisions this value is reserved.

#### Defined in

[packages/pointclouds/src/types.ts:33](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L33)

***

### RoadSurface

> **RoadSurface**: `11`

#### Defined in

[packages/pointclouds/src/types.ts:36](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L36)

***

### Snow

> **Snow**: `21`

#### Defined in

[packages/pointclouds/src/types.ts:74](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L74)

***

### TemporalExclusion

> **TemporalExclusion**: `22`

Features excluded due to changes over time between data sources – e.g., water
levels, landslides, permafrost

#### Defined in

[packages/pointclouds/src/types.ts:79](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L79)

***

### TransmissionTower

> **TransmissionTower**: `15`

#### Defined in

[packages/pointclouds/src/types.ts:50](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L50)

***

### Unclassified

> **Unclassified**: `1`

#### Defined in

[packages/pointclouds/src/types.ts:19](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L19)

***

### Water

> **Water**: `9`

#### Defined in

[packages/pointclouds/src/types.ts:34](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L34)

***

### WireConductor

> **WireConductor**: `14`

Wire conductor (phase).

#### Defined in

[packages/pointclouds/src/types.ts:49](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L49)

***

### WireGuard

> **WireGuard**: `13`

Wire guard shield.

#### Defined in

[packages/pointclouds/src/types.ts:45](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L45)

***

### WireStructureConnector

> **WireStructureConnector**: `16`

Wire-structure connector (e.g. insulator).

#### Defined in

[packages/pointclouds/src/types.ts:54](https://github.com/cognitedata/reveal/blob/3aaed3491dba3f4ba9ecd87f495d35383cc73a1d/viewer/packages/pointclouds/src/types.ts#L54)
