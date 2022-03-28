import Typography from 'antd/lib/typography';
import Popover from 'antd/lib/popover';

interface ColumnWrapperProps {
  title: string;
  width?: number;
}

const { Paragraph } = Typography;

const ColumnWrapper = ({ title, width = 150 }: ColumnWrapperProps) => (
  <Popover
    content={<Paragraph copyable={{ text: `${title}` }}>{title}</Paragraph>}
  >
    <div
      style={{
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        width,
        wordWrap: 'break-word',
        wordBreak: 'break-word',
      }}
    >
      {title}
    </div>
  </Popover>
);

export default ColumnWrapper;
