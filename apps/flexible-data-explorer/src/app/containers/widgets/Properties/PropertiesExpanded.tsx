import { Button } from '../../../components/buttons/Button';
import { BaseWidgetProps, Widget } from '../../../components/widget/Widget';

export const PropertiesExpanded = (props: BaseWidgetProps) => {
  return (
    <>
      <Widget.Header
        title={`Properties ${props.id}`}
        subtitle="lorem ipsum ras pareru going to the moutain"
      >
        <Button.Fullscreen onClick={() => props.onExpandClick?.(undefined)} />
      </Widget.Header>

      <Widget.Body>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>

        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>

        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>

        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>

        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>

        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
        <p>HI!</p>
      </Widget.Body>
    </>
  );
};
