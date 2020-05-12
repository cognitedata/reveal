import { ExplorerActionTypes } from "../types/explorer";

// Initial explorer state
const initialState = {};

// explorer reducer to update state with actions
export default (state = initialState, action: ExplorerActionTypes) =>
{
  switch (action.payload)
  {
    default:
      return state;
  }
};

