import {
  DetailCardBlock,
  DetailCardBlockContent,
  DetailCardBlockHeader,
  DetailCardColor,
  DetailCardMain,
  DetailCardWrapper,
} from './elements';

export type DetailCardMetadata = {
  color?: string;
  title: string;
  content?: string;
  layout?: {
    extendedWidth?: boolean;
  };
};

interface Props {
  data: DetailCardMetadata[];
}
export const DetailCard: React.FC<Props> = ({ data }) => {
  return (
    <DetailCardWrapper>
      {data.map((item) => (
        <DetailCardBlock key={item.title} flex={item?.layout?.extendedWidth}>
          <DetailCardMain>
            {item.color && <DetailCardColor color={item.color} />}
            <span>
              <DetailCardBlockHeader>{item.title}</DetailCardBlockHeader>
              <DetailCardBlockContent>
                {item.content || '-'}
              </DetailCardBlockContent>
            </span>
          </DetailCardMain>
        </DetailCardBlock>
      ))}
    </DetailCardWrapper>
  );
};
