import { GeneralDetails } from '../../../components/details';
import { Widget } from '../../../components/widget/Widget';

import { PropertiesProps } from './PropertiesWidget';

export const PropertiesExpanded: React.FC<PropertiesProps> = ({ data }) => {
  return (
    <Widget expanded>
      <Widget.Body>
        <GeneralDetails>
          {Object.keys(data || {}).map((key) => {
            const value = data?.[key];

            return (
              <GeneralDetails.Item
                key={key}
                name={key}
                value={JSON.stringify(value)}
              />
            );
          })}
        </GeneralDetails>
      </Widget.Body>
    </Widget>
  );
};
