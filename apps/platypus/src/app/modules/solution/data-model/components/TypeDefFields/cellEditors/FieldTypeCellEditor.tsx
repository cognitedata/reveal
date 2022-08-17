import { BuiltInType, DataModelTypeDefsField } from '@platypus/platypus-core';
import { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { Component } from 'react';
import { TypeSelect } from '../../SchemaTypeAndField/TypeSelect';

interface FieldNameEditorState {
  initialFieldType: string;
  field: DataModelTypeDefsField;
  error?: string;
  hasError: boolean;
}

export interface FieldTypeCellEditorParams extends ICellEditorParams {
  builtInTypes: BuiltInType[];
  customTypesNames: string[];
  error?: string;
}

export class FieldTypeCellEditor
  extends Component<FieldTypeCellEditorParams, FieldNameEditorState>
  implements ICellEditor
{
  private rootEl: HTMLDivElement;
  constructor(props: FieldTypeCellEditorParams) {
    super(props);

    this.state = {
      field: JSON.parse(JSON.stringify(props.data)) as DataModelTypeDefsField,
      initialFieldType: props.data.type.name,
      error: props.error,
      hasError: false,
    };

    this.rootEl = document.querySelector('.ag-popup-editor')!;
    this.onValueChanged = this.onValueChanged.bind(this);
  }

  componentDidMount() {
    if (this.props.cellStartedEdit && this.rootEl) this.focusIn();
  }

  componentDidUpdate() {
    this.rootEl.classList.remove('ag-cell-has-error');
    if (this.state.hasError) this.rootEl.classList.add('ag-cell-has-error');
  }
  isPopup() {
    return true;
  }

  focusIn() {
    //React tracks the mousedown and mouseup events for detecting mouse clicks, instead of the click event like most everything else.
    // Cogs select component does not support autofocus or any other type of control
    // this is workarround for the proplem
    const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
    function simulateMouseClick(element: HTMLDivElement) {
      mouseClickEvents.forEach((mouseEventType) =>
        element.dispatchEvent(
          new MouseEvent(mouseEventType, {
            view: window,
            bubbles: true,
            cancelable: true,
            buttons: 1,
          })
        )
      );
    }

    const getElement = (selector: string): HTMLDivElement => {
      return this.rootEl.querySelector(selector) as HTMLDivElement;
    };

    const input = this.rootEl.querySelector('input')! as HTMLInputElement;

    setTimeout(() => {
      simulateMouseClick(getElement('.cogs-select'));
      simulateMouseClick(getElement('.cogs-select__value-container'));

      input.click();
      input.focus();
      input.select();
    }, 10);
  }

  /* Component Editor Lifecycle methods */
  // the final value to send to the grid, on completion of editing
  getValue() {
    return this.state.field.type;
  }

  // Gets called once before editing starts, to give editor a chance to
  // cancel the editing before it even starts.
  isCancelBeforeStart() {
    return false;
  }

  // Gets called once when editing is finished (eg if Enter is pressed).
  // If you return true, then the result of the edit will be ignored.
  isCancelAfterEnd() {
    return this.state.initialFieldType === this.state.field.type.name;
  }

  onValueChanged(field: DataModelTypeDefsField) {
    this.setState({
      field: field,
    });

    if (this.state.initialFieldType !== field.type.name) {
      setTimeout(() => this.props.api.stopEditing());
    }
  }

  render() {
    return (
      <div
        style={{
          height: '36px',
          background: 'white',
          width: this.props.eGridCell.clientWidth,
        }}
      >
        <TypeSelect
          field={this.state.field}
          builtInTypes={this.props.builtInTypes}
          customTypesNames={this.props.customTypesNames}
          disabled={false}
          onValueChanged={({ value, isList }) => {
            const isCustomTypeSelected =
              this.props.customTypesNames.filter((name) => name === value)
                .length > 0;
            this.onValueChanged({
              ...this.state.field,
              directives: [],
              type: {
                ...this.state.field.type,
                name: value,
                list: isList,
                ...(isCustomTypeSelected
                  ? {
                      nonNull: false,
                    }
                  : {}),
              },
            });
          }}
        />
      </div>
    );
  }
}
