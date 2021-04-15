export default (appId: string): Promise<void> => {
  return new Promise((resolve) => {
    const intercom = window.Intercom;
    console.log('init start');
    if (typeof intercom === 'function') {
      intercom('reattach_activator');
      intercom('update', window.intercomSettings);
      resolve();
    } else {
      const doc = document;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const i: any = (...args: any[]) => {
        i.c(args);
      };
      i.q = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      i.c = (args: any) => {
        i.q.push(args);
      };

      window.Intercom = i;

      const createElement = () => {
        const element = doc.createElement('script');
        element.type = 'text/javascript';
        element.async = true;
        console.log('reach create element');
        element.onload = () => resolve();
        element.src = `https://widget.intercom.io/widget/${appId}`;
        const scriptEle = doc.getElementsByTagName('script')[0];
        if (scriptEle.parentNode) {
          scriptEle.parentNode.insertBefore(element, scriptEle);
        }
      };

      if (document.readyState === 'complete') {
        createElement();
      } else if (window.attachEvent) {
        window.attachEvent('onload', createElement);
      } else {
        window.addEventListener('load', createElement, false);
      }
    }
  });
};
