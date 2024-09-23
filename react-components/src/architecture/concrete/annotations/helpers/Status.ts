/*!
 * Copyright 2024 Cognite AS
 */

export enum Status {
  Contextualized, // This state is Approved and has AssetRef != undefined
  Approved,
  Suggested,
  Rejected
}

export const ALL_STATUSES = [
  Status.Rejected,
  Status.Suggested,
  Status.Approved,
  Status.Contextualized
];
