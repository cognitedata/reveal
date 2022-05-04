/*!
 * Copyright 2021 Cognite AS
 */

/**
 * ASPRS well known point class types.
 * @see {@link http://www.asprs.org/wp-content/uploads/2019/03/LAS_1_4_r14.pdf} (page 30)
 */
export enum WellKnownAsprsPointClassCodes {
  /**
   * Special value for all other classes. Some point in Potree might be in this class
   *
   */
  Default = -1,
  /**
   * Created, never classified.
   */
  Created = 0,
  Unclassified = 1,
  Ground = 2,
  LowVegetation = 3,
  MedVegetation = 4,
  HighVegetation = 5,
  Building = 6,
  /**
   * Low point, typically "low noise".
   */
  LowPoint = 7,
  /**
   * In previous revisions of LAS this was High point ("high noise"), in more recent
   * revisions this value is reserved.
   */
  ReservedOrHighPoint = 8,
  Water = 9,
  Rail = 10,
  RoadSurface = 11,
  /**
   * In previous revisions of LAS this was "Bridge deck", but in more recent
   * revisions this value is reserved.
   */
  ReservedOrBridgeDeck = 12,
  /**
   * Wire guard shield.
   */
  WireGuard = 13,
  /**
   * Wire conductor (phase).
   */
  WireConductor = 14,
  TransmissionTower = 15,
  /**
   * Wire-structure connector (e.g. insulator).
   */
  WireStructureConnector = 16,
  /**
   * Note that {@link WellKnownAsprsPointClassCodes.ReservedOrBridgeDeck} has been used
   * historically.
   */
  BridgeDeck = 17,
  /**
   * High point, or "high noise".
   * Note that {@link WellKnownAsprsPointClassCodes.ReservedOrHighPoint} has been used
   * historically.
   */
  HighNoise = 18,
  /**
   * E.g. conveyors, mining equipment, traffic lights.
   */
  OverheadStructure = 19,
  /**
   * E.g. breakline proximity.
   */
  IgnoredGround = 20,
  Snow = 21,
  /**
   * Features excluded due to changes over time between data sources – e.g., water
   * levels, landslides, permafrost
   */
  TemporalExclusion = 22,

  /**
   * First user definable class identifier (64).
   * Values up to and including 63 are reserved
   */
  UserDefinableOffset = 64
}
