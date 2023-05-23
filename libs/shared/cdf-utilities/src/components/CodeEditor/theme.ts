import { Extension } from '@codemirror/state';
import { Colors } from '@cognite/cogs.js';
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import { css } from 'styled-components';

import { CodeEditorTheme } from '.';

const databaseIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.254 5.637v2.36c.002.014.025.099.182.244.192.177.508.37.957.544.89.346 2.163.573 3.607.573 1.444 0 2.717-.227 3.607-.573.449-.175.765-.367.957-.544.157-.145.18-.23.182-.244v-2.36c-.23.134-.482.252-.748.355-1.052.41-2.466.65-3.998.65s-2.946-.24-3.998-.65a5.376 5.376 0 0 1-.748-.355ZM14 3.821v8.604c0 .614-.356 1.048-.687 1.318-.349.284-.813.51-1.33.688C10.94 14.789 9.535 15 8 15c-1.535 0-2.94-.21-3.983-.57-.517-.177-.981-.403-1.33-.687-.33-.27-.687-.704-.687-1.318V3.82c0-.609.318-1.072.661-1.388.35-.322.819-.58 1.341-.783C5.054 1.24 6.468 1 8 1s2.946.24 3.998.65c.522.203.99.461 1.34.783.344.316.662.78.662 1.388ZM3.254 9.82v2.566a.664.664 0 0 0 .152.158c.192.157.512.328.965.484.898.308 2.179.51 3.629.51 1.45 0 2.731-.202 3.629-.51.453-.156.773-.327.965-.484a.665.665 0 0 0 .152-.158V9.82c-.228.132-.478.25-.742.352-1.05.41-2.463.649-4.004.649-1.54 0-2.954-.24-4.004-.649a5.35 5.35 0 0 1-.742-.352Zm9.492-1.823V8v-.003Zm0-4.176c-.007-.023-.037-.105-.183-.24-.194-.177-.512-.369-.962-.544-.893-.347-2.166-.574-3.601-.574s-2.708.227-3.601.574c-.45.175-.768.367-.962.545-.146.134-.176.216-.182.239.006.023.036.105.182.239.194.178.512.37.962.545.893.347 2.166.574 3.601.574s2.708-.227 3.601-.574c.45-.175.768-.367.962-.545.146-.134.176-.216.182-.24Z' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;
const tableIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1 3.249A2.249 2.249 0 0 1 3.249 1h9.502A2.249 2.249 0 0 1 15 3.249v9.502A2.249 2.249 0 0 1 12.751 15H3.25A2.249 2.249 0 0 1 1 12.751V3.25Zm2.249-.602a.602.602 0 0 0-.602.602v2.027h4.53V2.647H3.248Zm5.575 0v2.629h4.529V3.249a.602.602 0 0 0-.602-.602H8.824Zm4.529 4.276h-4.53v2.154h4.53V6.923Zm0 3.801h-4.53v2.629h3.928c.333 0 .602-.27.602-.602v-2.027Zm-6.177 2.629v-2.629H2.647v2.027c0 .333.27.602.602.602h3.927ZM2.647 9.077h4.53V6.923h-4.53v2.154Z' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;
const columnIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M1 3.249A2.249 2.249 0 0 1 3.249 1h9.502A2.249 2.249 0 0 1 15 3.249v9.502A2.249 2.249 0 0 1 12.751 15H3.25A2.249 2.249 0 0 1 1 12.751V3.25Zm2.249-.602a.602.602 0 0 0-.602.602v9.502c0 .333.27.602.602.602h2.027V2.647H3.249Zm3.674 0v10.706h2.154V2.647H6.923Zm3.801 0v10.706h2.027c.333 0 .602-.27.602-.602V3.25a.602.602 0 0 0-.602-.602h-2.027Z' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;
const stringIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.91 1h-.05c-.942 0-1.722 0-2.34.083-.65.087-1.23.279-1.694.743-.464.465-.656 1.044-.743 1.694C1 4.138 1 4.918 1 5.86V10.14c0 .942 0 1.722.083 2.34.087.65.279 1.23.743 1.694.465.464 1.044.656 1.694.743C4.138 15 4.918 15 5.86 15H10.14c.942 0 1.722 0 2.34-.083.65-.087 1.23-.279 1.694-.743.464-.465.656-1.044.743-1.694.083-.618.083-1.398.083-2.34V5.86c0-.942 0-1.722-.083-2.34-.087-.65-.279-1.23-.743-1.694-.465-.464-1.044-.656-1.694-.743C11.862 1 11.082 1 10.14 1H5.91ZM2.86 2.86c.148-.147.367-.262.855-.327.51-.069 1.19-.07 2.195-.07h4.18c1.005 0 1.686.001 2.195.07.488.065.707.18.854.328.148.147.263.366.328.854.069.51.07 1.19.07 2.195v4.18c0 1.005-.001 1.686-.07 2.195-.065.488-.18.707-.328.854-.147.148-.366.263-.854.328-.509.069-1.19.07-2.195.07H5.91c-1.005 0-1.686-.001-2.195-.07-.488-.065-.707-.18-.854-.328-.148-.147-.263-.366-.328-.854-.069-.509-.07-1.19-.07-2.195V5.91c0-1.005.001-1.686.07-2.195.065-.488.18-.707.328-.854Zm2.737 2.79v-.053h1.672v4.806h-.444a.731.731 0 1 0 0 1.463h2.35a.731.731 0 0 0 0-1.463h-.444V5.597h1.672v.052a.731.731 0 1 0 1.463 0v-.731c0-.552-.486-.784-.794-.784H4.928c-.308 0-.794.232-.794.784v.731a.731.731 0 0 0 1.463 0Z' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;
const numberIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M4.384 13.17a.762.762 0 0 0 1.518.137l.196-2.164H9.33l-.184 2.026a.762.762 0 0 0 1.518.138l.196-2.164h1.902a.762.762 0 1 0 0-1.524h-1.763l.294-3.238h1.945a.762.762 0 1 0 0-1.524h-1.806l.184-2.026a.762.762 0 1 0-1.518-.138l-.196 2.164H6.67l.184-2.026a.762.762 0 1 0-1.518-.138L5.14 4.857H3.238a.762.762 0 1 0 0 1.524h1.763l-.294 3.238H2.762a.762.762 0 0 0 0 1.524h1.806l-.184 2.026Zm1.853-3.551h3.232l.294-3.238H6.531l-.294 3.238Z' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;
const booleanIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.5 4a4 4 0 1 0 0 8h5a4 4 0 0 0 0-8h-5Zm2.019 1.333H5.5a2.667 2.667 0 0 0 0 5.334h2.019A3.985 3.985 0 0 1 6.5 8c0-1.024.385-1.959 1.019-2.667Zm2.981 5.334a2.667 2.667 0 1 0 0-5.334 2.667 2.667 0 0 0 0 5.334Z' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;
const functionIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M14.794 10.555a.687.687 0 0 0-.535-.262c-.168 0-.581.062-.782.645-.05.146-.065.224-.134.216-.115-.012-.565-.531-.712-1.293l-.365-1.843c.288-.504.585-.894.88-1.158a.891.891 0 0 1 .56-.227c.562-.041.766-.118.904-.222a.896.896 0 0 0 .352-.722.919.919 0 0 0-.257-.653.85.85 0 0 0-.627-.257c-.363 0-.77.181-1.246.554-.281.22-.579.541-.9.97-.105-.42-.195-.617-.261-.734-.205-.366-.539-.366-.649-.366l-.12.002-3.39.086.192-.874c.121-.57.281-1.022.474-1.342.094-.156.238-.341.388-.341.057 0 .17.01.38.057.585.136.804.152.918.152.251 0 .472-.09.64-.262a.942.942 0 0 0 .264-.672.953.953 0 0 0-.36-.75C10.203 1.087 9.92 1 9.57 1c-.525 0-1.081.181-1.654.538A4.11 4.11 0 0 0 6.53 2.995c-.31.537-.578 1.29-.817 2.296H4.614a.5.5 0 0 0-.487.386l-.094.403a.5.5 0 0 0 .487.614h.867L4.25 11.636c-.236 1.023-.409 1.275-.456 1.328-.129.143-.394.173-.594.173-.248 0-.512-.019-.787-.057a3.546 3.546 0 0 0-.44-.037c-.276 0-.504.078-.675.23a.906.906 0 0 0-.297.691c0 .216.065.525.373.777.211.172.499.259.856.259.892 0 1.724-.383 2.473-1.138.727-.734 1.26-1.813 1.584-3.207l.9-3.96 3.07.056.33 1.53-.672 1.072a6.407 6.407 0 0 1-.792.974c-.193-.255-.413-.385-.652-.385-.224 0-.428.1-.588.287a.97.97 0 0 0-.233.64c0 .292.115.55.333.749.2.182.446.274.733.274.355 0 .718-.146 1.08-.434.302-.242.69-.72 1.188-1.46.319.991.771 1.628.987 1.894.34.42.89.67 1.47.67.492 0 .771-.222 1.017-.419l.022-.017c.43-.344.52-.722.52-.98a.905.905 0 0 0-.205-.591' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;
const keywordIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M2.609 3.333c0-.4.324-.725.725-.725h2a.725.725 0 1 1 0 1.45h-2a.725.725 0 0 1-.725-.725Zm4.666 0c0-.4.325-.725.725-.725h6a.725.725 0 0 1 0 1.45H8a.725.725 0 0 1-.725-.725ZM1.275 6.667c0-.4.325-.725.725-.725h7.334a.725.725 0 1 1 0 1.45H2a.725.725 0 0 1-.725-.725Zm10 0c0-.4.325-.725.725-.725h.667a.725.725 0 0 1 0 1.45H12a.725.725 0 0 1-.725-.725ZM2.609 10c0-.4.324-.725.725-.725h3.333a.725.725 0 0 1 0 1.45H3.334A.725.725 0 0 1 2.609 10Zm6 0c0-.4.324-.725.725-.725H14a.725.725 0 0 1 0 1.45H9.334A.725.725 0 0 1 8.609 10ZM1.275 13.333c0-.4.325-.725.725-.725h6a.725.725 0 0 1 0 1.45H2a.725.725 0 0 1-.725-.725Zm8.667 0c0-.4.325-.725.725-.725h2a.725.725 0 0 1 0 1.45h-2a.725.725 0 0 1-.725-.725Z' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;
const warningFilledIcon = (color: string, size: number) => css`
  content: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' width='${size}' height='${size}' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='m14.7 11.068-4.38-8.623a2.586 2.586 0 0 0-4.64 0L1.3 11.068C.391 12.858 1.655 15 3.62 15h8.76c1.965 0 3.229-2.142 2.32-3.932ZM8.915 5.5A.92.92 0 0 0 8 4.58a.92.92 0 0 0-.915.92V8a.915.915 0 1 0 1.83 0V5.5ZM8 12.308a1.077 1.077 0 1 0 0-2.154 1.077 1.077 0 0 0 0 2.154Z' fill='${color}'%3E%3C/path%3E%3C/svg%3E");
`;

export const editorStyle = () => css`
  .cm-editor {
    height: 100%;

    &.cm-focused {
      outline: none;
    }

    .cm-tooltip-autocomplete {
      background-color: ${Colors['surface--muted']};
      border-radius: 8px;
      padding: 4px;
      border: 1px solid ${Colors['border--muted']};

      li {
        border-radius: 6px;
        line-height: 20px;
        height: 24px;
        padding: 2px 4px;
        overflow: hidden;

        &:hover {
          background-color: ${Colors['surface--interactive--hover']};
        }

        .cm-completionLabel {
          color: ${Colors['text-icon--medium']};
        }

        .cm-completionDetail {
          float: right;
          color: ${Colors['text-icon--muted']};
          font-style: normal;
        }

        .cm-completionIcon {
          box-sizing: content-box;
          height: 100%;
          width: 1em;

          &:before {
            display: inline-block;
            height: 20px;
            vertical-align: middle;
          }

          &:after {
            color: gray;
          }
        }

        .cm-completionIcon-database:before {
          ${databaseIcon('gray', 16)};
        }

        .cm-completionIcon-table:before {
          ${tableIcon('gray', 16)};
        }

        .cm-completionIcon-column:before {
          ${columnIcon('gray', 16)};
        }

        .cm-completionIcon-string:before {
          ${stringIcon('gray', 16)};
        }

        .cm-completionIcon-number:before {
          ${numberIcon('gray', 16)};
        }

        .cm-completionIcon-boolean:before {
          ${booleanIcon('gray', 16)};
        }

        .cm-completionIcon-object:before {
          ${columnIcon('gray', 16)};
        }

        .cm-completionIcon-vector:before {
          ${columnIcon('gray', 16)};
        }

        .cm-completionIcon-function:before {
          ${functionIcon('gray', 16)};
        }

        .cm-completionIcon-function:after {
          display: none;
        }

        .cm-completionIcon-keyword:before {
          ${keywordIcon('gray', 16)};
        }

        .cm-completionIcon-keyword:after {
          display: none;
        }
      }

      li[aria-selected='true'] {
        background-color: ${Colors['surface--action--muted--hover']};
        color: ${Colors['text-icon--strong']};

        :hover {
          background-color: ${Colors['surface--action--muted--pressed']};
        }

        .cm-completionDetail {
          color: ${Colors['text-icon--strong']};
        }

        .cm-completionIcon-database:before {
          ${databaseIcon('black', 16)};
        }

        .cm-completionIcon-table:before {
          ${tableIcon('black', 16)};
        }

        .cm-completionIcon-column:before {
          ${columnIcon('black', 16)};
        }

        .cm-completionIcon-string:before {
          ${stringIcon('black', 16)};
        }

        .cm-completionIcon-number:before {
          ${numberIcon('black', 16)};
        }

        .cm-completionIcon-boolean:before {
          ${booleanIcon('black', 16)};
        }

        .cm-completionIcon-object:before {
          ${columnIcon('black', 16)};
        }

        .cm-completionIcon-vector:before {
          ${columnIcon('black', 16)};
        }

        .cm-completionIcon-function:before {
          ${functionIcon('black', 16)};
        }

        .cm-completionIcon-keyword:before {
          ${keywordIcon('black', 16)};
        }
      }
    }

    .cm-scroller {
      background-color: inherit;

      .cm-gutters {
        border-right: none;

        .cm-gutter.cm-foldGutter {
          .cm-gutterElement {
            padding: 0 4px;

            span {
              padding: 0;
            }
          }
        }

        .cm-gutter.cm-lineNumbers {
          .cm-gutterElement {
            min-width: unset;
            padding: 0 0 0 4px;
          }
        }

        .cm-gutter.cm-gutter-lint {
          width: 20px;

          .cm-gutterElement {
            padding-left: 6px;

            .cm-lint-marker-error:before {
              ${warningFilledIcon('%23a8361c', 14)};
            }
          }
        }
      }

      .cm-content {
        padding: 16px 0;

        .cm-line {
          padding-left: 16px;
          padding-right: 16px;
        }
      }
    }

    .cm-scroller,
    .cm-tooltip-autocomplete ul {
      font-family: 'Source Code Pro', 'monospace';
      font-weight: 500;
      font-size: 13px;
      line-height: 20px;
    }

    .cm-search.cm-panel {
      font-size: 14px;
    }

    .cm-button {
      --cogs-btn-color-secondary: #efefef;
      --cogs-btn-color-secondary--hover: var(--cogs-decorative--grayscale--400);
      --cogs-btn-color-secondary--active: var(
        --cogs-decorative--grayscale--500
      );

      --cogs-btn-border-radius: var(--cogs-border-radius--default);
      --cogs-btn-color-inverted: var(--cogs-decorative--grayscale--800);

      display: inline-flex;
      height: 28px;
      align-items: center;
      justify-content: center;
      border: none;
      background: var(--cogs-btn-color-secondary);
      border-radius: var(--cogs-btn-border-radius);
      color: var(--cogs-btn-color-inverted);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      line-height: 1;
      outline: none;
      transition: background-color var(--cogs-transition-time-fast);
      user-select: none;
      padding: 4px 8px;

      &:focus-visible {
        box-shadow: 0px 0px 0px 4px rgba(74, 103, 251, 0.7);
      }

      &:hover {
        background: var(--cogs-btn-color-secondary--hover);
        box-shadow: none;
        color: var(--cogs-btn-color-inverted);
      }
      &:active {
        background: var(--cogs-btn-color-secondary--active);
        box-shadow: none;
        color: var(--cogs-btn-color-inverted);
      }
    }

    .cm-textfield {
      --cogs-input-hover-background: var(--cogs-decorative--grayscale--white);
      --cogs-input-hover-border: 2px solid var(--cogs-decorative--blue--400);
      --cogs-input-border: 2px solid var(--cogs-decorative--grayscale--400);
      --cogs-input-bordered-shadow: 0 0 0 1px var(--cogs-decorative--blue--400)
        inset;
      --cogs-input-side-padding: 12px;

      color: var(--cogs-decorative--grayscale--1000);
      font-size: var(--cogs-font-size-sm);
      font-style: normal;
      font-weight: 400;
      line-height: 20px;

      height: 28px;
      box-sizing: border-box;
      padding: 0 var(--cogs-input-side-padding);
      border: var(--cogs-input-border);
      border-radius: var(--cogs-border-radius--default);
      outline: none;
      transition: border var(--cogs-transition-time-fast / 2) linear;

      &::placeholder {
        color: var(--cogs-decorative--grayscale--600);
      }

      &:hover {
        border: var(--cogs-input-hover-border);
        background: var(--cogs-input-hover-background);
        transition: border var(--cogs-transition-time-fast) linear;
      }

      &:focus {
        border-color: var(--cogs-decorative--blue--400);
        background: var(--cogs-decorative--grayscale--white);
        box-shadow: var(--cogs-input-bordered-shadow);
      }
    }
  }
`;

const lightThemeSyntaxStyles = [
  { tag: [t.comment, t.bracket], color: '#6a737d' },
  { tag: [t.className, t.propertyName], color: '#6f42c1' },
  {
    tag: [t.variableName, t.attributeName, t.number, t.operator],
    color: '#005cc5',
  },
  { tag: [t.keyword], color: '#d73a49' },
  {
    tag: [t.typeName, t.typeOperator, t.typeName],
    color: '#6f42c1',
  },
  { tag: [t.string, t.meta, t.regexp], color: '#22863a' },
  { tag: [t.name, t.quote], color: '#032f62' },
  { tag: [t.heading], color: '#24292e', fontWeight: 'bold' },
  { tag: [t.emphasis], color: '#24292e', fontStyle: 'italic' },
  { tag: [t.deleted], color: '#b31d28', backgroundColor: '#ffeef0' },
];

/**
 * NOTE Altered copy of githubLight
 * Using `settings` colors from our last discussions.
 * More info on CDFUX-1682 & CDFUX-1743
 * https://github.com/uiwjs/react-codemirror/blob/master/themes/github/src/index.ts
 */
const lightTheme = createTheme({
  theme: 'light',
  settings: {
    background: '#f7f8f9',
    foreground: Colors['text-icon--medium'],
    selection: Colors['surface--status-neutral--strong--pressed'],
    selectionMatch: Colors['surface--status-neutral--muted--pressed'],
    gutterBackground: '#f7f8f9',
    gutterForeground: Colors['text-icon--interactive--disabled'],
    gutterBorder: 'transparent',
    lineHighlight: Colors['surface--misc-code--muted'],
    caret: Colors['decorative--grayscale--black'],
  },
  styles: lightThemeSyntaxStyles,
});

const darkThemeSyntaxStyles = [
  { tag: [t.comment, t.bracket], color: '#8b949e' },
  { tag: [t.className, t.propertyName], color: '#d2a8ff' },
  {
    tag: [t.variableName, t.attributeName, t.number, t.operator],
    color: '#79c0ff',
  },
  { tag: [t.keyword], color: '#ff7b72' },
  {
    tag: [t.typeName, t.typeOperator, t.typeName],
    color: '#ff7b72',
  },
  { tag: [t.string, t.meta, t.regexp], color: '#7ee787' },
  { tag: [t.name, t.quote], color: '#a5d6ff' },
  { tag: [t.heading], color: '#d2a8ff', fontWeight: 'bold' },
  { tag: [t.emphasis], color: '#d2a8ff', fontStyle: 'italic' },
  { tag: [t.deleted], color: '#ffdcd7', backgroundColor: '#ffeef0' },
];

const darkTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#38373e',
    foreground: Colors['text-icon--medium--inverted'],
    selection: Colors['surface--status-neutral--strong--pressed--inverted'],
    selectionMatch: 'transparent',
    gutterBackground: '#38373e',
    gutterForeground: Colors['text-icon--interactive--disabled--inverted'],
    gutterBorder: 'transparent',
    lineHighlight: Colors['surface--action--muted--default--inverted'],
    caret: Colors['decorative--grayscale--white'],
  },
  styles: darkThemeSyntaxStyles,
});

export const getTheme = (theme?: CodeEditorTheme): Extension => {
  switch (theme) {
    case 'dark':
      return darkTheme;
    case 'light':
      return lightTheme;
    default:
      return lightTheme;
  }
};
