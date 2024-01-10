self.onmessage = (event: MessageEvent) => {
  const inputData = new Float64Array(event.data);

  // Perform your numerical work on the input array
  const resultData = processData(inputData);

  // Send the result back to the main thread
  postMessage(resultData.buffer, { transfer : [resultData.buffer]});
};

// Example numerical work function
function processData(inputData: Float64Array): Float64Array {
  // Perform your computation here
  // This is just a dummy example, replace with your actual computation
  for (let i = 0; i < inputData.length; i++) {
    inputData[i] = inputData[i] * 2;
  }

  return inputData;
}