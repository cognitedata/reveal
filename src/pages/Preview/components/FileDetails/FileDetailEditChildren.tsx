import styled from 'styled-components';
import { Body, Input } from '@cognite/cogs.js';
import React, { ReactText } from 'react';
import { useDispatch } from 'react-redux';
import { fileInfoEdit } from 'src/store/previewSlice';
import { CopyableText } from 'src/pages/Preview/components/CopyableText/CopyableText';

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

const NOT_SET_PLACEHOLDER = 'None Set';

export const FileDetailFieldView = (props: {
  id: string;
  title: string;
  placeholder?: string;
  value?: ReactText;
  copyable?: boolean;
  editable?: boolean;
}) => {
  const dispatch = useDispatch();

  const onInput = (evt: any) => {
    dispatch(fileInfoEdit({ key: props.id, value: evt.target.value }));
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
                value={props.value}
                onInput={onInput}
                style={{ paddingInline: 12 }}
              />
            </FieldViewInputContainer>
          ) : (
            <FieldViewText>{fieldValue}</FieldViewText>
          )}
        </CopyableText>
      </FieldViewTextContainer>
    </FieldViewContainer>
  );
};

// todo: change this to show geo tag info
// const FileDetailFieldsView = (props: {
//   title: string;
//   fields: ReactText[];
// }) => {
//   return (
//     <FieldViewContainer>
//       <FieldViewTitle level={2} strong>
//         {props.title}
//       </FieldViewTitle>
//       <FieldViewTextContainer>
//         {props.fields.map((field, index, array) => {
//           return (
//             <FieldViewText key={field}>
//               {field}
//               {index !== array.length - 1 ? ',' : ''}
//             </FieldViewText>
//           );
//         })}
//         {props.fields.length === 0 && (
//           <FieldViewText>{NOT_SET_PLACEHOLDER}</FieldViewText>
//         )}
//       </FieldViewTextContainer>
//     </FieldViewContainer>
//   );
// };
