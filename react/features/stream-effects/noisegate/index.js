// @flow

// Script expects to find rnnoise webassembly binary in the same public path root, otherwise it won't load
// During the build phase this needs to be taken care of manually
import rnnoiseWasmInit from 'rnnoise-wasm';

import NoiseGateProcessor from './NoiseGateProcessor';

export { RNNOISE_SAMPLE_LENGTH } from './NoiseGateProcessor';
export type { NoiseGateProcessor };

let noisegateModule;

/**
 * Creates a new instance of NoiseGateProcessor.
 *
 * @returns {Promise<NoiseGateProcessor>}
 */
export function createNoiseGateProcessor() {
    if (!noisegateModule) {
        noisegateModule = rnnoiseWasmInit();
    }

    return noisegateModule.then(mod => new NoiseGateProcessor(mod));
}
