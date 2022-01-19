import React from 'react';
import { StoryWrapper } from "../stories/StoryWrapper";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}
export const decorators = [
  (Story) => <StoryWrapper><Story /></StoryWrapper>
]