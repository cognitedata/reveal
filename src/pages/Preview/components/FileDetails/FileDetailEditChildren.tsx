import styled from 'styled-components';
import { Body, Icon, Input } from '@cognite/cogs.js';
import React, { ReactText, useEffect, useState } from 'react';
import { CopyableText } from 'src/pages/Preview/components/CopyableText/CopyableText';
import { LabelFilter } from '@cognite/data-exploration';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

const FieldViewContainer = styled.div`
  margin-bottom: 14px;
`;

const FieldViewTitle = styled(Body)`
  margin-bottom: 4px;
`;
const FieldViewTextContainer = styled.div`
  display: flex;
  align-items: center;
`;
const FieldViewText = styled.span`
  margin-left: 12px;
`;
const FieldViewInputContainer = styled.div`
  width: 450px;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
`;

const NOT_SET_PLACEHOLDER = 'None Set';

const useIsFieldSavePending = (id: string) => {
  const [loading, setLoadingState] = useState<boolean>(false);
  const loadingField = useSelector(
    ({ previewSlice }: RootState) => previewSlice.loadingField
  );

  useEffect(() => {
    if (loadingField === id) {
      setLoadingState(true);
    }
    if (loadingField === null) {
      setLoadingState(false);
    }
  }, [loadingField]);

  return loading;
};

const Loader = (props: { loading: boolean }) => {
  if (props.loading) {
    return (
      <FlexContainer className="loader-container">
        {props.loading && <Icon type="Loading" style={{ color: '#4a67fb' }} />}
      </FlexContainer>
    );
  }
  return null;
};

export const FileDetailFieldView = (props: {
  id: string;
  title: string;
  placeholder?: string;
  value?: ReactText;
  copyable?: boolean;
  editable?: boolean;
  onBlur?: (key: string, value: ReactText) => void;
  onInput?: (key: string, value: ReactText) => void;
}) => {
  const loading = useIsFieldSavePending(props.id);

  const onInput = (evt: any) => {
    if (props.onInput) {
      props.onInput(props.id, evt.target.value);
    }
  };

  const onBlur = () => {
    if (props.onBlur) {
      props.onBlur(props.id, props.value || '');
    }
  };

  const fieldValue = props.value || NOT_SET_PLACEHOLDER;
  return (
    <FieldViewContainer>
      <FieldViewTitle level={2} strong>
        {props.title}
      </FieldViewTitle>
      <FieldViewTextContainer>
        <CopyableText copyable={props.copyable} text={props.value}>
          {props.editable ? (
            <FieldViewInputContainer>
              <Input
                size="default"
                fullWidth
                placeholder={props?.placeholder || NOT_SET_PLACEHOLDER}
                value={props.value || ''}
                onInput={onInput}
                style={{ paddingInline: 12 }}
                onBlur={onBlur}
              />
            </FieldViewInputContainer>
          ) : (
            <FieldViewText>{fieldValue}</FieldViewText>
          )}
        </CopyableText>
        {props.editable && <Loader loading={loading} />}
      </FieldViewTextContainer>
    </FieldViewContainer>
  );
};

export const LabelContainerView = (props: {
  value: v3.Label[] | undefined;
  setValue: (labels?: v3.Label[]) => void;
}) => {
  const loading = useIsFieldSavePending('labels');

  const handleSetValue = (val?: v3.Label[]) => {
    props.setValue(val);
  };
  return (
    <LabelFieldContainer>
      <LabelContainer>
        <LabelFilter
          resourceType="file"
          value={props.value}
          setValue={handleSetValue}
        />
      </LabelContainer>
      <Loader loading={loading} />
    </LabelFieldContainer>
  );
};

const LabelFieldContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;

  & div.loader-container {
    margin-top: 20px;
  }
`;

const LabelContainer = styled.div`
  width: 450px;

  & div.title:first-child {
    color: var(--cogs-b2-color);
    font-size: var(--cogs-b2-font-size);
    font-weight: 500;
    line-height: var(--cogs-b2-line-height);
    letter-spacing: var(--cogs-b2-letter-spacing);
    margin-top: 0 !important;
    margin-bottom: 4px !important;
  }
`;
