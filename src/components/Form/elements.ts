import styled from 'styled-components';
import { Input, Select, Col, Icon, Textarea } from '@cognite/cogs.js';
import { Input as AntdInput } from 'antd';

export const FormInputNumber = styled(AntdInput)`
  &&& {
    margin-bottom: 1em;
    border-radius: var(--cogs-border-radius--default);
    color: var(--cogs-greyscale-grey10);
    font-size: var(--cogs-font-size-sm);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    --cogs-input-default-height: 36px;
    --cogs-title-as-placeholder-height: 40px;
    --cogs-title-as-placeholder-side-padding: 12px;
    --cogs-title-as-placeholder-with-icon-side-padding: 34px;
    --cogs-input-side-padding: 12px;
    --cogs-input-with-icon-side-padding: 38px;
    height: var(--cogs-input-default-height);
    box-sizing: border-box;
    padding: 0 var(--cogs-input-side-padding);
    border: var(--cogs-input-border);
    --cogs-input-default-border-color: var(--cogs-greyscale-grey4);
    outline: none;
    &&&.ant-input-affix-wrapper-focused {
      box-shadow: none !important;
      border-color: var(--cogs-midblue-4);
      background: var(--cogs-white);
      outline: 0;
      box-shadow: var(--cogs-input-bordered-shadow);
    }
  }
`;

export const FormInput = styled(Input)`
  &&& {
    margin-bottom: 1em;
  }
`;

export const FormTextarea = styled(Textarea)`
  &&& {
    margin-bottom: 1em;
  }
`;

export const FormSelect = styled(Select)`
  &&& {
    margin-bottom: 1em;
  }
`;

export const FieldTitle = styled.div`
  &&& {
    margin-bottom: 0.5em;
  }
`;

export const FieldTitleInfo = styled(FieldTitle)`
  &&&:after {
    content: '?';
    color: white;
    background: #3f56b5;
    border-radius: 60%;
    padding: 0em 0.25em;
    margin-left: 0.5em;
    position: relative;
    font-size: 0.8em;
  }
`;

export const FieldTitleRequired = styled(FieldTitle)`
  &&&:after {
    content: '*';
    margin-left: 2px;
    color: var(--cogs-midorange-1);
  }
`;

export const FieldHelperText = styled(Col)`
  &&& {
    position: relative;
    top: -14px;
    font-size: 90%;
  }
`;

export const InfoBoxHeadingContainer = styled.div`
  font-weight: bold;
  margin-bottom: 1em;
`;

export const InfoBoxHeadingIcon = styled(Icon)`
  position: relative;
  top: -10px;
  color: #fff;
  border-radius: 50%;
  padding: 0.2em 0.2em;
  width: 1.5em;
  height: 1.2em;
  margin-right: 0.8em;
`;

export const InfoBoxHeadingIconRed = styled(InfoBoxHeadingIcon)`
  top: 0;
  background: var(--cogs-text-icon--status-critical);
`;

export const InfoBoxHeadingIconSuccess = styled(InfoBoxHeadingIcon)`
  background: var(--cogs-green);
`;

export const StyledError = styled.div`
  margin-top: 1em;
  padding: 1em;
  background: rgba(223, 64, 55, 0.06);
  border: 1px solid rgba(223, 66, 55, 0.2);
  border-radius: 8px;
`;

export const StyledSuccess = styled.div`
  margin-top: 1em;
  padding: 1em;
  background: rgba(57, 162, 99, 0.1);
  border: 1px solid rgba(57, 162, 99, 0.2);
  border-radius: 8px;
`;

export const ClientCredentialsWrapper = styled.div`
  &&& {
    padding: 1em;
    background: var(--cogs-greyscale-grey2);
    border-radius: 8px;
  }
`;

export const ClientCredentialsWrapperError = styled(StyledError)`
  &&& {
    margin-bottom: 1em;
  }
`;

export const ClientCredentialsWrapperSuccess = styled(StyledSuccess)`
  &&& {
    margin-bottom: 1em;
  }
`;

export const Divider = styled.div`
  &&& {
    margin-top: 1em;
    margin-bottom: 1em;
    text-align: center;
  }
`;

export const DividerText = styled.span`
  &&& {
    width: 50px;
    background: white;
    position: relative;
    padding: 0 10px;
    font-weight: 600;
  }
`;

export const Line = styled.div`
  &&& {
    width: 100%;
    border-bottom: 1px solid lightgray;
    position: relative;
    top: 12px;
  }
`;

export const ClientCredentialsDetails = styled.div`
  margin-top: 1em;
`;

export const ClientCredentialsOptionMessage = styled.div`
  margin: 0.5em 0em;
`;
