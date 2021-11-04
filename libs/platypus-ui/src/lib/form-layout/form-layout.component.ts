export interface FormLayoutProps {
  columns: number;
  updateStyles: () => void;
}

export class FormLayout extends HTMLElement implements FormLayoutProps {
  private _shadowRoot;
  private _columnCount: number;

  static get observedAttributes() {
    return ['columns'];
  }
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._shadowRoot.innerHTML = `
    ${this.getTemplate()}
    `;

    this._columnCount = 2;
  }

  get columns() {
    return this._columnCount;
  }

  set columns(numberOfCols: number) {
    this._columnCount = numberOfCols;
    this.updateStyles();
  }

  connectedCallback() {
    this.updateStyles();
  }

  attributeChangedCallback(attr: string, oldVal: string, newVal: string) {
    if (attr === 'columns') {
      this._columnCount = +newVal;
      this.updateStyles();
    }
  }

  private naturalNumberOrOne(n: number) {
    if (!isNaN(n) && n >= 1 && n < Infinity) {
      return Math.floor(n);
    }
    return 1;
  }

  updateStyles() {
    /*
        The item width formula:
            itemWidth = colspan / columnCount * 100% - columnSpacing
        We have to subtract columnSpacing, because the column spacing space is taken
        by item margins of 1/2 * spacing on both sides
      */
    const columnSpacing = getComputedStyle(this).getPropertyValue(
      '--form-layout-column-spacing'
    );
    const direction = getComputedStyle(this).direction;
    const marginStartProp =
      'margin-' + (direction === 'ltr' ? 'left' : 'right');
    const marginEndProp = 'margin-' + (direction === 'ltr' ? 'right' : 'left');

    const containerWidth = this.offsetWidth;
    const columnCount = parseInt(this._columnCount.toString(), 10);
    let col = 0;

    Array.from(this.children)
      .filter(
        (child) =>
          child.localName === 'br' || getComputedStyle(child).display !== 'none'
      )
      .forEach((child: any, index, children) => {
        if (child.localName === 'br') {
          // Reset column count on line break
          col = 0;
          return;
        }

        let colspan;
        colspan = this.naturalNumberOrOne(
          parseFloat(child.getAttribute('colspan') as string)
        );

        // Never span further than the number of columns
        colspan = Math.min(colspan, columnCount);

        const childRatio = colspan / columnCount;

        // Note: using 99.9% for 100% fixes rounding errors in MS Edge
        // (< v16), otherwise the items might wrap, resizing is wobbly.
        (child as HTMLElement).style.width = `calc(${childRatio * 99.9}% - ${
          1 - childRatio
        } * ${columnSpacing})`;

        if (col + colspan > columnCount) {
          // Too big to fit on this row, let’s wrap it
          col = 0;
        }

        // At the start edge
        if (col === 0) {
          child.style.setProperty(marginStartProp, '0px');
        } else {
          child.style.removeProperty(marginStartProp);
        }

        const nextIndex = index + 1;
        const nextLineBreak =
          nextIndex < children.length && children[nextIndex].localName === 'br';

        // At the end edge
        if (col + colspan === columnCount) {
          child.style.setProperty(marginEndProp, '0px');
        } else if (nextLineBreak) {
          const colspanRatio = (columnCount - col - colspan) / columnCount;
          child.style.setProperty(
            marginEndProp,
            `calc(${
              colspanRatio * containerWidth
            }px + ${colspanRatio} * ${columnSpacing})`
          );
        } else {
          child.style.removeProperty(marginEndProp);
        }

        // Move the column counter
        col = (col + colspan) % columnCount;
      });
  }

  protected getTemplate() {
    return `
    ${this.getStyles()}
    <div id="layout">
      <slot id="slot"></slot>
    </div>
    `;
  }

  protected getStyles() {
    return `
    <style>
    :host {
      --form-layout-column-spacing: 24px;
      display: block;
      max-width: 100%;
      animation: 1ms form-layout-appear;
      align-self: stretch;
    }
    @keyframes form-layout-appear {
      to {
        opacity: 1 !important;
      }
    }
    :host([hidden]) {
      display: none !important;
    }
    #layout {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
    }
    #layout ::slotted(*) {
      /* Items should neither grow nor shrink. */
      flex-grow: 0;
      flex-shrink: 0;
      /* Margins make spacing between the columns */
      margin-left: calc(0.5 * var(--form-layout-column-spacing));
      margin-right: calc(0.5 * var(--form-layout-column-spacing));
    }
    #layout ::slotted(br) {
      display: none;
    }
    </style>
    `;
  }
}
