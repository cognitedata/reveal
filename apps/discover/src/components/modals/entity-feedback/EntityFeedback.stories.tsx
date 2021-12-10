import EntityFeedback from './EntityFeedbackModal';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Modals / entity-feedback',
  component: EntityFeedback,
  decorators: [
    (storyFn: any) => (
      <div style={{ position: 'relative', height: 200 }}>{storyFn()}</div>
    ),
  ],
  parameters: {
    componentSubtitle: 'NB: This is a redux connected component',
  },
};

export const Basic = () => {
  // const [isOpen, setIsOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  // const item = {
  //   url: '',
  //   id: 1,
  // };

  // const sendObjectFeedback = () => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2500);
  // };

  // const removeSensitiveDocument = () => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2500);
  // };

  return (
    <div>
      <EntityFeedback
      // isOpen={isOpen}
      // handleToggleDisplay={() => setIsOpen(false)}
      // documentId='1'
      // sendObjectFeedback={sendObjectFeedback}
      // removeSensitiveDocument={removeSensitiveDocument}
      />
    </div>
  );
};
