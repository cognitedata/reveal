import styled from 'styled-components';
import Input from 'antd/lib/input';

export const FieldLabel = styled.p`
  font-weight: bold;
  font-size: 14px;
  margin-top: 20px;
`;

export const RequiredFieldLabel = styled(FieldLabel)`
  :before {
    content: '*  ';
    color: red;
  }
`;

export const FieldDescription = styled.p`
  font-weight: normal;
  font-size: 14px;
  margin-bottom: 32px;
`;

export const RoundedInput = styled(Input)`
  .ant-input {
    border-radius: 4px;
  }
  .ant-input-group-addon {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

export const ParagraphEllipsis = styled.p`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
