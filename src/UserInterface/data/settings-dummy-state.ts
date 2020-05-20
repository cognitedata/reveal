import { IconTypes } from "../constants/Icons";

// Dummy Settings State
export const state = {
  id: "435nj43kn5i",
  titleBar: {
    name: "Well 7",
    icon: { type: IconTypes.NODES, name: "WellNode" },
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
  },
  sections: [
    {
      name: "General Info",
      isExpanded: true,
      elements: [
        {
          label: "Name",
          type: "text",
          value: "Random Polylines 5",
        },
        {
          label: "Color",
          type: "color-table",
          value: "#FF0000",
        },
        {
          label: "Type name",
          type: "text",
          value: "Polylines",
          isReadOnly: true,
        },
        {
          label: "Data type",
          type: "text",
          value: "Continuous",
          isReadOnly: true,
        },
        {
          label: "Unique id",
          type: "text",
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
          subElements: [
            {
              type: "text",
              value: 8102.53,
              isReadOnly: true,
            },
            {
              type: "text",
              value: 8102.53,
              isReadOnly: true,
            },
            {
              type: "text",
              value: 5924.44,
              isReadOnly: true,
            },
          ],
        },
        {
          isReadOnly: true,
          label: "Y(Min/Max/Delta)",
          type: "input-group",
          subElements: [
            {
              type: "text",
              value: 5717.63,
              isReadOnly: true,
            },
            {
              type: "text",
              value: 8109.4,
              isReadOnly: true,
            },
            {
              type: "text",
              value: 2391.77,
              isReadOnly: true,
            },
          ],
        },
        {
          isReadOnly: true,
          label: "Z(Min/Max/Delta)",
          type: "input-group",
          subElements: [
            {
              type: "text",
              value: -2092.65,
              isReadOnly: true,
            },
            {
              type: "text",
              value: -723.08,
              isReadOnly: true,
            },
            {
              type: "text",
              value: 1369.57,
              isReadOnly: true,
            },
          ],
        },
        {
          isReadOnly: true,
          label: "Number of Polylines/Points",
          type: "input-group",
          subElements: [
            {
              type: "text",
              value: 10,
              isReadOnly: true,
            },
            {
              type: "text",
              value: 7140,
              isReadOnly: true,
            },
          ],
        },
      ],
    },
    {
      name: "Visual Settings",
      isExpanded: true,
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
          icon: {
            type: IconTypes.NODES,
            name: "MapIcon",
          },
          selected: true,
          action: {
            type: "EXPAND",
            subSectionId: 0,
          },
        },
        {
          icon: {
            type: IconTypes.NODES,
            name: "PointCloudNode",
          },
          selected: false,
          action: {
            type: "EXPAND",
            subSectionId: 1,
          },
        },
        {
          icon: {
            type: IconTypes.NODES,
            name: "PolylinesNode",
          },
          selected: true,
          action: {
            type: "EXPAND",
            subSectionId: 2,
          },
        },
      ],
      elements: [
        {
          label: "Inc",
          type: "text",
          value: "5",
        },
      ],
      subSections: [
        {
          name: "Solid",
          isExpanded: true,
          iconIndex: 3,
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
                  icon: { type: IconTypes.NODES, name: "MapIcon" },
                },
                {
                  name: "Folder",
                  icon: { type: IconTypes.NODES, name: "FolderNode" },
                },
              ],
            },
            {
              isReadOnly: true,
              label: "Contour Type",
              type: "select",
              value: 1,
              options: [{ name: "Line" }, { name: "Continuous" }],
            },
            {
              isReadOnly: false,
              label: "Bump Map",
              type: "select",
              value: 3,
              checked: false,
              options: [
                { name: "Noise" },
                { name: "Line" },
                { name: "Solid" },
                { name: "Know" },
              ],
            },
            {
              isReadOnly: false,
              label: "Transparency",
              checked: false,
              type: "range",
              value: 95,
            },
            {
              isReadOnly: false,
              label: "Shadow",
              checked: false,
              type: "range",
              value: 45,
            },
            {
              isReadOnly: false,
              label: "Specular",
              checked: false,
              type: "range",
              value: 50,
            },
            {
              isReadOnly: false,
              label: "Specular Size",
              checked: false,
              type: "range",
              value: 67,
            },
          ],
        },
        {
          name: "Lines",
          isExpanded: false,
          iconIndex: 4,
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
                  icon: { type: IconTypes.NODES, name: "MapIcon" },
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
        {
          name: "Points",
          iconIndex: 5,
          isExpanded: true,
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
                  icon: { type: IconTypes.NODES, name: "MapIcon" },
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
                {
                  name: "Sphere",
                  icon: { type: IconTypes.POINT_SYMBOL, name: "Sphere" },
                },
                {
                  name: "Cube",
                  icon: { type: IconTypes.POINT_SYMBOL, name: "Cube" },
                },
              ],
            },
            {
              isReadOnly: false,
              label: "Filter",
              type: "input-group",
              checked: false,
              subElements: [
                {
                  type: "select",
                  value: 0,
                  options: [
                    { name: "Decimate" },
                    { name: "Every Nth" },
                    { name: "First" },
                    { name: "Last" },
                  ],
                },
                {
                  type: "select",
                  value: 0,
                  options: [{ name: 2 }],
                },
              ],
            },
            {
              isReadOnly: false,
              label: "Transparency",
              checked: false,
              type: "range",
              value: 95,
            },
          ],
        },
      ],
    },
  ],
};
