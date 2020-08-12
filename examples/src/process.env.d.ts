/*
 * Copyright 2020 Cognite AS
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_PROJECT?: string

      REACT_APP_CAD_ID?: number
      REACT_APP_CAD_REVISION_ID?: number

      REACT_APP_CAD_2_ID?: number
      REACT_APP_CAD_2_REVISION_ID?: number

      REACT_APP_POINTCLOUD_ID?: number
      REACT_APP_POINTCLOUD_REVISION_ID?: number
    }
  }
}

// convert it into a module by adding an empty export statement.
export {}
