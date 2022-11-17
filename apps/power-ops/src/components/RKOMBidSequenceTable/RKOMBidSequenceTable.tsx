import { StyledSequenceTable } from 'components/RKOMTable/elements';
import uniqueId from 'lodash/uniqueId';

type Props = {
  prices: number[];
  priceUnit: string;
  volumes: number[];
  volumeUnit: string;
};

export const RKOMBidSequenceTable = ({
  prices,
  priceUnit,
  volumes,
  volumeUnit,
}: Props) => {
  return (
    <StyledSequenceTable>
      <tbody>
        <tr key={uniqueId('price')}>
          <th>Price {priceUnit && <p>{priceUnit}</p>}</th>
          {prices.map((price) => (
            <td key={uniqueId(String(price))}>{price}</td>
          ))}
        </tr>
        <tr key={uniqueId('volume')}>
          <th>Volume {volumeUnit && <p>{volumeUnit}</p>}</th>
          {volumes.map((volume) => (
            <td key={uniqueId(String(volume))}>{volume}</td>
          ))}
        </tr>
      </tbody>
    </StyledSequenceTable>
  );
};
