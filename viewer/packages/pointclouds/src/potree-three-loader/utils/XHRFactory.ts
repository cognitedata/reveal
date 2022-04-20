
const XHRFactory = {
  config: {
    withCredentials: false,
    customHeaders: [
      { header: null, value: null }
    ]
  },

  createXMLHttpRequest: function () {
    let xhr = new XMLHttpRequest();

    if (this.config.customHeaders &&
      Array.isArray(this.config.customHeaders) &&
      this.config.customHeaders.length > 0) {
      let baseOpen = xhr.open;
      let customHeaders = this.config.customHeaders;
      xhr.open = function () {
	baseOpen.apply(this, ([] as any).slice.call(arguments));
	customHeaders.forEach(function (customHeader: any) {
	  if (!!customHeader.header && !!customHeader.value) {
	    xhr.setRequestHeader(customHeader.header, customHeader.value);
	  }
	});
      };
    }

    return xhr;
  }
};

export { XHRFactory };
