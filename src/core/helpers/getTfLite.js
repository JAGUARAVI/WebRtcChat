import { getTFLiteModelFileName } from './segmentationHelper';

export async function getTfLite(res = '160x96') {
    let tflite = await createTFLiteModule();
    let simd = false;

    try {
        tflite = await createTFLiteSIMDModule();
        simd = true;
    }
    catch (error) {
        console.log('Failed to create TFLite SIMD WebAssembly module.', error);
    }

    const modelFileName = getTFLiteModelFileName(res);
    const modelResponse = await fetch(`/models/${modelFileName}.tflite`);
    const model = await modelResponse.arrayBuffer();
    const modelBufferOffset = tflite._getModelBufferMemoryOffset();
    tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
    tflite._loadModel(model.byteLength);
    return [tflite, simd];
}