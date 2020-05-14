import { v4 as uuidv4 } from "uuid";
import { IconTypes } from "../constants/Icons";

export const state1 = {
  id: uuidv4(),
  sections: {
    section1: {
      name: "Random Polylines 1",
      icon: { type: IconTypes.NODES, name: "PolylinesNode" },
      toolBar: [
        {
          icon: { type: IconTypes.STATES, name: "Pinned" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatLeft" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatRight" },
        },
      ],
      subSections: [
        {
          name: "General Info",
          isExpanded: true,
          elements: [
            {
              label: "Name",
              type: "input",
              value: "Random Polylines 5",
            },
            {
              label: "Color",
              type: "color-table",
              value: "#FF0000",
            },
            {
              label: "Type name",
              type: "input",
              value: "Polylines",
              isReadOnly: true,
            },
            {
              label: "Data type",
              type: "input",
              value: "Continuous",
              isReadOnly: true,
            },
            {
              label: "Unique id",
              type: "input",
              value: "459ff014-c0aa-4267-8e77-02e0d917c67e",
              isReadOnly: true,
            },
          ],
        },
        {
          name: "Statistics",
          isExpanded: false,
          elements: [
            {
              isReadOnly: true,
              label: "X(Min/Max/Delta)",
              type: "input-group",
              value: [5924.44, 8102.53, 2178.09],
            },
            {
              isReadOnly: true,
              label: "Y(Min/Max/Delta)",
              type: "input-group",
              value: [5717.63, 8109.4, 2391.77],
            },
            {
              isReadOnly: true,
              label: "Z(Min/Max/Delta)",
              type: "input-group",
              value: [-2092.65, -723.08, 1369.57],
            },
            {
              isReadOnly: true,
              label: "Number of Polylines/Points",
              type: "input-group",
              value: [10, 7140],
            },
          ],
        },
      ],
    },
    section2: {
      name: "Visual Settings",
      toolBar: [
        {
          icon: { type: IconTypes.ACTIONS, name: "Paste" },
        },
        {
          icon: { type: IconTypes.ACTIONS, name: "Reset" },
        },
        {
          icon: { type: IconTypes.ACTIONS, name: "Solution" },
        },
        {
          icon: { type: IconTypes.NODES, name: "PointCloudNode" },
        },
        {
          icon: { type: IconTypes.NODES, name: "PolylinesNode" },
        },
      ],
      subSections: [
        {
          name: "Lines",
          isExpanded: false,
          elements: [
            {
              isReadOnly: false,
              label: "Color type",
              type: "select",
              value: 0,
              options: [
                {
                  name: "Node",
                  icon: {
                    type: IconTypes.NODES,
                    name: "PointCloudNode",
                  },
                },
                {
                  name: "Z values",
                  icon: { type: IconTypes.NODES, name: "Map" },
                },
                {
                  name: "Folder",
                  icon: { type: IconTypes.NODES, name: "FolderNode" },
                },
              ],
            },
            {
              isReadOnly: true,
              label: "Pipe",
              type: "select",
              value: 1,
              options: [
                { name: "1" },
                { name: "2" },
                { name: "3" },
                { name: "4" },
              ],
            },
            {
              isReadOnly: false,
              label: "Line width",
              type: "select",
              value: 3,
              options: [
                { name: "1" },
                { name: "2" },
                { name: "3" },
                { name: "4" },
              ],
            },
            {
              label: "Line symbol",
              type: "select",
              value: 1,
              options: [{ name: "Solid" }, { name: "Dash" }, { name: "Dot" }],
            },
          ],
        },
      ],
    },
    section3: {
      name: "New random Wells",
      icon: { type: IconTypes.NODES, name: "PolylinesNode" },
      toolBar: [
        {
          icon: { type: IconTypes.STATES, name: "Pinned" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatLeft" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatRight" },
        },
      ],
      subSections: [
        {
          name: "General Info",
          isExpanded: true,
          elements: [],
        },
      ],
    },
  },
};

export const state2 = {
  id: uuidv4(),
  sections: {
    section1: {
      name: "Galaxy",
      icon: { type: IconTypes.NODES, name: "PointsNode" },
      toolBar: [
        {
          icon: { type: IconTypes.STATES, name: "Pinned" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatLeft" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatRight" },
        },
      ],
      subSections: [
        {
          name: "General Info",
          isExpanded: true,
          elements: [
            {
              label: "Name",
              type: "input",
              value: "Random Polylines 5",
            },
            {
              label: "Color",
              type: "color-table",
              value: "#00ff00",
            },
            {
              label: "Type name",
              type: "input",
              value: "Point Cloud",
              isReadOnly: true,
            },
            {
              label: "Data type",
              type: "input",
              value: "Continuous",
              isReadOnly: true,
            },
            {
              label: "Unique id",
              type: "input",
              value: "459ff014-c0aa-4267-8e77-02e0d917c67e",
              isReadOnly: true,
            },
          ],
        },
        {
          name: "Statistics",
          isExpanded: false,
          elements: [
            {
              isReadOnly: true,
              label: "X(Min/Max/Delta)",
              type: "input-group",
              value: [5924.44, 8102.53, 2178.09],
            },
            {
              isReadOnly: true,
              label: "Y(Min/Max/Delta)",
              type: "input-group",
              value: [5717.63, 8109.4, 2391.77],
            },
            {
              isReadOnly: true,
              label: "Z(Min/Max/Delta)",
              type: "input-group",
              value: [-2092.65, -723.08, 1369.57],
            },
            {
              isReadOnly: true,
              label: "Number of Polylines/Points",
              type: "input-group",
              value: [10, 7140],
            },
          ],
        },
      ],
    },
    section2: {
      name: "Visual Settings",
      toolBar: [
        {
          icon: { type: IconTypes.ACTIONS, name: "Paste" },
        },
        {
          icon: { type: IconTypes.ACTIONS, name: "Reset" },
        },
        {
          icon: { type: IconTypes.ACTIONS, name: "Solution" },
        },
        {
          icon: { type: IconTypes.NODES, name: "PointCloudNode" },
        },
        {
          icon: { type: IconTypes.NODES, name: "PolylinesNode" },
        },
      ],
      subSections: [
        {
          name: "Points",
          isExpanded: false,
          elements: [
            {
              isReadOnly: false,
              label: "Color type",
              type: "select",
              value: 2,
              options: [
                {
                  name: "Node",
                  icon: {
                    type: IconTypes.NODES,
                    name: "PointCloudNode",
                  },
                },
                {
                  name: "Z values",
                  icon: { type: IconTypes.NODES, name: "Map" },
                },
                {
                  name: "Folder",
                  icon: { type: IconTypes.NODES, name: "FolderNode" },
                },
              ],
            },
            {
              isReadOnly: true,
              label: "Radius",
              type: "select",
              value: 1,
              options: [
                { name: "1" },
                { name: "2" },
                { name: "3" },
                { name: "4" },
              ],
            },
            {
              isReadOnly: false,
              label: "Symbol",
              type: "select",
              value: 0,
              options: [
                { name: "Sphere", icon: { type: IconTypes.POINT_SYMBOL, name: "Sphere" } },
                { name: "Cube", icon: { type: IconTypes.POINT_SYMBOL, name: "Cube" } }
              ],
            }
          ],
        },
      ],
    },
    section3: {
      name: "New random Wells",
      icon: { type: IconTypes.NODES, name: "PolylinesNode" },
      toolBar: [
        {
          icon: { type: IconTypes.STATES, name: "Pinned" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatLeft" },
        },
        {
          icon: { type: IconTypes.ARROWS, name: "FatRight" },
        },
      ],
      subSections: [
        {
          name: "General Info",
          isExpanded: true,
          elements: [],
        },
      ],
    },
  },
};

