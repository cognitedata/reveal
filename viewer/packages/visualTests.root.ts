/*!
 * Copyright 2022 Cognite AS
 */

export default [
  (await import('./sector-parser/app/SectorParser.VisualTestFixture')).default,
  (await import('./sector-loader/app/SectorLoader.VisualTestFixture')).default
];
