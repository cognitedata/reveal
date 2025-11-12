/*!
 * Copyright 2025 Cognite AS
 */
export type SemanticVersion = `${number}.${number}.${number}`;

/**
 * Checks if a string is a valid semantic version.
 * @param version The semantic version string (e.g., "1.0.0").
 * @returns True if the version is valid, false otherwise.
 */
export function isSemanticVersion(version: string): version is SemanticVersion {
  const semverRegex: RegExp = /^([1-9]\d*|0)(\.(([1-9]\d*)|0)){2}$/;
  return semverRegex.test(version);
}

/**
 * Compares a semantic version to a target semantic version.
 * @param formatVersion The semantic version string to compare (e.g., "1.0.0").
 * @param targetVersion The target semantic version string (e.g., "1.0.1").
 * @returns True if formatVersion >= targetVersion, false otherwise.
 */
export function isSemanticVersionGreaterThanOrEqual(
  formatVersion: SemanticVersion,
  targetVersion: SemanticVersion
): boolean {
  const [major, minor, patch] = formatVersion.split('.').map(Number);
  const [targetMajor, targetMinor, targetPatch] = targetVersion.split('.').map(Number);

  if (major > targetMajor) return true;
  if (major === targetMajor && minor > targetMinor) return true;
  if (major === targetMajor && minor === targetMinor && patch >= targetPatch) return true;

  return false;
}
