/*!
 * Copyright 2022 Cognite AS
 */
export type VisualTestFixture = {
  run(): Promise<void>;
  dispose(): void;
};
