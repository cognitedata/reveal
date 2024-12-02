/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { uniq } from 'lodash';
import { isDefined } from '../../../../utilities/isDefined';

export async function createUserMap(
  sdk: CogniteClient,
  userIds: string[]
): Promise<Map<string, string | undefined>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const uniqueUserIds = uniq(userIds);

  const profiles = await sdk.profiles.retrieve(uniqueUserIds.map((id) => ({ userIdentifier: id })));

  const idNamePairs = profiles
    .filter(isDefined)
    .map((profile) => [profile.userIdentifier, profile.displayName ?? undefined] as const);

  return new Map(idNamePairs);
}
