import { Tooltip } from '@cognite/cogs.js';
import {
  SolutionDataModelFieldNameValidator,
  ValidatorResult,
} from '@platypus/platypus-core';
import { ICellEditor, ICellEditorParams } from 'ag-grid-community';
import { ChangeEvent, Component, createRef } from 'react';

interface FieldNameEditorState {
  initialValue: string;
  isDirty: boolean;
  value: string;
  error?: string;
  hasError: boolean;
  isErrorTooltipShown: boolean;
}

export interface FieldNameCellEditorParams extends ICellEditorParams {
  error?: string;
}

export class FieldNameCellEditor
  extends Component<FieldNameCellEditorParams, FieldNameEditorState>
  implements ICellEditor
{
  private nameValidator: SolutionDataModelFieldNameValidator;
  private inputRef: any;
  private typeFieldNames: { id: string; name: string }[];

  constructor(props: FieldNameCellEditorParams) {
    super(props);
    this.inputRef = createRef();

    this.typeFieldNames = props.context.typeFieldNames;

    this.nameValidator = new SolutionDataModelFieldNameValidator();
    this.state = {
      initialValue: props.value.toString(),
      value: props.charPress || props.value.toString(),
      error: props.error,
      isDirty: false,
      hasError: false,
      isErrorTooltipShown: false,
    };

    this.onValueChanged = this.onValueChanged.bind(this);
    this.validate = this.validate.bind(this);
    this.focusIn = this.focusIn.bind(this);
  }

  componentDidMount() {
    if (this.props.cellStartedEdit) this.focusIn();
  }

  focusIn() {
    this.inputRef.current.focus();
  }

  /* Component Editor Lifecycle methods */
  // the final value to send to the grid, on completion of editing
  getValue() {
    return this.state.value;
  }

  // Gets called once before editing starts, to give editor a chance to
  // cancel the editing before it even starts.
  isCancelBeforeStart() {
    return false;
  }

  // Gets called once when editing is finished (eg if Enter is pressed).
  // If you return true, then the result of the edit will be ignored.
  isCancelAfterEnd() {
    const validationResult = this.validate(this.state.value);
    return this.state.isDirty && !validationResult.valid ? true : false;
  }

  onValueChanged(event: ChangeEvent<HTMLInputElement>) {
    const validationResult = this.validate(event.target.value);
    const updatedValue = !event.target.value ? '' : event.target.value;

    this.setState({
      value: updatedValue,
      hasError: !validationResult.valid,
      error: !validationResult.valid ? validationResult.errors.name : '',
      isDirty: updatedValue !== this.state.initialValue,
    });

    // Cogs hides and modifies orignial tippy props
    // You can not trigger the tooltip manually
    // this is a hack to trigger the tooltip
    setTimeout(() => {
      if (
        this.inputRef &&
        !validationResult.valid &&
        !this.state.isErrorTooltipShown
      ) {
        this.inputRef.current.click();
      }
    }, 10);
  }

  private validate(value: string): ValidatorResult {
    const nameValidationResult = this.nameValidator.validate('name', value);
    if (!nameValidationResult.valid) {
      return nameValidationResult;
    }
    const isSameFieldPresent = this.typeFieldNames.some(
      (nameField) =>
        nameField.name === value && nameField.id !== this.props.data.id
    );

    return {
      valid: !isSameFieldPresent,
      errors: {
        name: isSameFieldPresent ? 'Duplicate field name' : '',
      },
    };
  }

  render() {
    const classNames = `field-input ${this.state.hasError ? 'has-error' : ''}`;

    // Cogs hides and modifies orignial tippy props
    // You can not trigger the tooltip manually
    // this is a hack to trigger the tooltip
    const tooltipProps = {
      trigger: 'mouseenter focus click manual',
    } as any;

    return (
      <Tooltip
        content={this.state.error || ''}
        disabled={!this.state.hasError}
        delay={0}
        elevated
        position="bottom"
        onShow={() =>
          this.setState({
            ...this.state,
            isErrorTooltipShown: true,
          })
        }
        onHide={() =>
          this.setState({
            ...this.state,
            isErrorTooltipShown: false,
          })
        }
        {...tooltipProps}
      >
        <div className={classNames}>
          <input
            ref={this.inputRef}
            type={'text'}
            data-cy="schema-type-field"
            value={this.state.value}
            onChange={this.onValueChanged}
          />
        </div>
      </Tooltip>
    );
  }
}
