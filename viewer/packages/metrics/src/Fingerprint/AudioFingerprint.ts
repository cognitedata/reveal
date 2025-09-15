function setCompressorValueIfDefined( 
  compressor: DynamicsCompressorNode,
  context: OfflineAudioContext,
  item: keyof DynamicsCompressorNode,
  value: number
) {
  const param = compressor[item] as AudioParam | undefined;
    if (param?.setValueAtTime) {
        param.setValueAtTime(value, context.currentTime);
    }
}

export async function generateAudioFingerprint(): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            // OfflineAudioContext renders audio in memory
            const OfflineAudioContext = (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext);
            
            if (!OfflineAudioContext) {
                return reject(new Error("Offline Audio Context is not supported."));
            }

            // 44100 is the 44.1kHz
            const context = new OfflineAudioContext(1, 44100, 44100);
            const currentTime = context.currentTime;
            
            const oscillator = context.createOscillator();
            oscillator.type = "triangle";
            oscillator.frequency.setValueAtTime(10000, currentTime);
            
            // Each call contributes to uniqunes of fingerprint
            const compressor = context.createDynamicsCompressor();
            setCompressorValueIfDefined(compressor, context, 'threshold', -50);
            setCompressorValueIfDefined(compressor, context, 'knee', 40);
            setCompressorValueIfDefined(compressor, context, 'ratio', 12);
            setCompressorValueIfDefined(compressor, context, 'reduction', -20);
            setCompressorValueIfDefined(compressor, context, 'attack', 0);
            setCompressorValueIfDefined(compressor, context, 'release', .25);
            
            oscillator.connect(compressor);
            compressor.connect(context.destination);

            oscillator.start(0);
            context.startRendering();

            context.oncomplete = (event) => {
                let output = 0;
                // Sum the absolute values of a stable section of the audio buffer.
                // This skips the unstable "transient" at the beginning of the signal.
                for (let i = 4500; i < 5000; i++) {
                    const channelData = event.renderedBuffer.getChannelData(0)[i];
                    output += Math.abs(channelData);
                }
                const fingerprint = output.toString();
                resolve(fingerprint);
            };

        } catch (error) {
            reject(error);
        }
    });
}