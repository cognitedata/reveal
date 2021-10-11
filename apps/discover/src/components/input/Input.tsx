import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';

import { withStyles } from 'styles/withStyles';

const StyledAdornment = withStyles(() => ({
  root: {
    '& svg': {
      width: 16,
      height: 16,
    },
  },
  positionStart: {
    marginRight: -8,
    paddingLeft: 16,
  },
  positionEnd: {
    marginLeft: -8,
    paddingRight: 16,
  },
}))(InputAdornment);

const StyledInputLabel = withStyles((theme: any) => ({
  root: {
    color: theme.palette.secondary.main,
    left: 16,
    fontSize: 12,
    lineHeight: '16px',
    fontStyle: 'normal',
    fontWeight: 500,
    top: 3,
  },
  error: {
    color: `${theme.palette.error.main} !important`,
  },
  disabled: {
    color: theme.palette.black.opacity80,
  },
}))(InputLabel);

const StyledInput = withStyles((theme: any) => ({
  root: {
    backgroundColor: theme.palette.common.white,

    border: `1px solid ${theme.palette.primary.opacity20}`,
    borderRadius: 4,

    'label + &': {
      marginTop: 17,
    },
    '&:hover': {
      boxShadow: `0px 0px 2px 0px rgba(0,0,0,0.55)`,
      borderColor: theme.palette.primary.opacity40,
    },
  },
  input: {
    height: 24,
    position: 'relative',
    fontSize: 14,
    lineHeight: '24px',
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
    marginLeft: 16,
    marginRight: 16,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    fontStyle: 'normal',
    fontWeight: 'normal',
    '&:focus': {},
  },
  inputMultiline: {
    height: 'auto !important',
  },
  disabled: {
    backgroundColor: theme.palette.black.opacity10,
    '&:hover': {
      boxShadow: `0px 0px 0px 0px rgba(0,0,0,0)`,
      borderColor: theme.palette.primary.opacity20,
    },
  },
  error: {
    borderColor: theme.palette.error.main,
    '&:hover': {
      boxShadow: `0px 0px 2px 0px ${theme.palette.error.opacity80}`,
      borderColor: theme.palette.error.main,
    },
  },
  focused: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.primary.main,
  },
}))(InputBase);

const StyledFormHelperText = withStyles((theme: any) => ({
  root: {
    color: theme.palette.black.opacity40,
    left: 16,
    fontSize: 12,
    lineHeight: '16px',
    fontStyle: 'normal',
    fontWeight: 500,
    marginTop: 4,
    paddingLeft: 16,
  },
  error: {
    color: `${theme.palette.error.main} !important`,
  },
  disabled: {
    color: theme.palette.black.opacity80,
  },
}))(FormHelperText);

interface Props {
  id?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  Icon?: React.ReactNode | undefined;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
  multiline?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  rows?: number;
  value?: string | number;
  type?: string;
}

export const Input: React.FC<Props> = React.forwardRef<any, Props>(
  (props, ref) => {
    const {
      label,
      helperText,
      error = false,
      disabled,
      Icon,
      iconPosition = 'start',
      fullWidth,
      multiline,
      ...other
    } = props;
    return (
      <FormControl
        error={error}
        fullWidth={fullWidth}
        disabled={disabled}
        ref={ref}
      >
        {label && <StyledInputLabel shrink>{label}</StyledInputLabel>}

        {Icon && iconPosition === 'start' && (
          <StyledInput
            {...other}
            fullWidth={fullWidth}
            multiline={multiline}
            startAdornment={
              <StyledAdornment position="start">{Icon}</StyledAdornment>
            }
          />
        )}
        {Icon && iconPosition === 'end' && (
          <StyledInput
            {...other}
            fullWidth={fullWidth}
            multiline={multiline}
            endAdornment={
              <StyledAdornment position="end">{Icon}</StyledAdornment>
            }
          />
        )}
        {!Icon && (
          <StyledInput {...other} fullWidth={fullWidth} multiline={multiline} />
        )}

        {helperText && (
          <StyledFormHelperText>{helperText}</StyledFormHelperText>
        )}
      </FormControl>
    );
  }
);

export default Input;
