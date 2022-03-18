class XHRFactory {
  config: {
    withCredentials: boolean;
    customHeaders: { header: string | null; value: string | null }[];
  } = {
    withCredentials: false,
    customHeaders: [{ header: null, value: null }]
  };

  createXMLHttpRequest(): XMLHttpRequest {
    const xhr = new XMLHttpRequest();

    if (this.config.customHeaders && Array.isArray(this.config.customHeaders) && this.config.customHeaders.length > 0) {
      const baseOpen = xhr.open.bind(xhr);
      const customHeaders = this.config.customHeaders;
      xhr.open = function (...args: any[]) {
        baseOpen.apply(xhr, [].slice.call(args));
        customHeaders.forEach(function (customHeader: any) {
          if (!!customHeader.header && !!customHeader.value) {
            xhr.setRequestHeader(customHeader.header, customHeader.value);
          }
        });
      };
    }

    return xhr;
  }
}

const XHRFactoryInstance = new XHRFactory();

export { XHRFactoryInstance };
