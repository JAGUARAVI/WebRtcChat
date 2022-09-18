import { inputResolutions, } from '../../core/helpers/segmentationHelper';
export function buildCanvas2dPipeline(sourcePlayback, backgroundConfig, segmentationConfig, canvas, tflite, addFrameEvent = () => { }) {
    const ctx = canvas.getContext('2d');
    const [segmentationWidth, segmentationHeight] = inputResolutions[segmentationConfig.inputResolution];
    const segmentationPixelCount = segmentationWidth * segmentationHeight;
    const segmentationMask = new ImageData(segmentationWidth, segmentationHeight);
    const segmentationMaskCanvas = document.createElement('canvas');
    segmentationMaskCanvas.width = segmentationWidth;
    segmentationMaskCanvas.height = segmentationHeight;
    const segmentationMaskCtx = segmentationMaskCanvas.getContext('2d');
    const inputMemoryOffset = tflite._getInputMemoryOffset() / 4;
    const outputMemoryOffset = tflite._getOutputMemoryOffset() / 4;
    let postProcessingConfig;
    async function render() {
        if (backgroundConfig.type !== 'none') {
            resizeSource();
        }
        addFrameEvent();
        if (backgroundConfig.type !== 'none') {
            runTFLiteInference();
        }
        addFrameEvent();
        runPostProcessing();
    }
    function updatePostProcessingConfig(newPostProcessingConfig) {
        postProcessingConfig = newPostProcessingConfig;
    }
    function updateBackgroundConfig(newBackgroundConfig) {
        backgroundConfig = newBackgroundConfig;
    }
    function cleanUp() {
        // Nothing to clean up in this rendering pipeline
    }
    function resizeSource() {
        segmentationMaskCtx.drawImage(sourcePlayback.htmlElement, 0, 0, sourcePlayback.width, sourcePlayback.height, 0, 0, segmentationWidth, segmentationHeight);
        const imageData = segmentationMaskCtx.getImageData(0, 0, segmentationWidth, segmentationHeight);
        for (let i = 0; i < segmentationPixelCount; i++) {
            tflite.HEAPF32[inputMemoryOffset + i * 3] = imageData.data[i * 4] / 255;
            tflite.HEAPF32[inputMemoryOffset + i * 3 + 1] =
                imageData.data[i * 4 + 1] / 255;
            tflite.HEAPF32[inputMemoryOffset + i * 3 + 2] =
                imageData.data[i * 4 + 2] / 255;
        }
    }
    function runTFLiteInference() {
        tflite._runInference();
        for (let i = 0; i < segmentationPixelCount; i++) {
            const background = tflite.HEAPF32[outputMemoryOffset + i * 2];
            const person = tflite.HEAPF32[outputMemoryOffset + i * 2 + 1];
            const shift = Math.max(background, person);
            const backgroundExp = Math.exp(background - shift);
            const personExp = Math.exp(person - shift);
            // Sets only the alpha component of each pixel
            segmentationMask.data[i * 4 + 3] =
                (255 * personExp) / (backgroundExp + personExp); // softmax
        }
        segmentationMaskCtx.putImageData(segmentationMask, 0, 0);
    }
    function runPostProcessing() {
        ctx.globalCompositeOperation = 'copy';
        ctx.filter = 'none';
        if (postProcessingConfig?.smoothSegmentationMask) {
            if (backgroundConfig.type === 'blur') {
                ctx.filter = 'blur(8px)'; // FIXME Does not work on Safari
            }
            else if (backgroundConfig.type === 'media') {
                ctx.filter = 'blur(4px)'; // FIXME Does not work on Safari
            }
        }
        if (backgroundConfig.type !== 'none') {
            drawSegmentationMask();
            ctx.globalCompositeOperation = 'source-in';
            ctx.filter = 'none';
        }
        ctx.drawImage(sourcePlayback.htmlElement, 0, 0);
        if (backgroundConfig.type === 'blur') {
            blurBackground();
        } else if (backgroundConfig.type === 'media') {
            drawBackground();
        }
    }
    function drawSegmentationMask() {
        ctx.drawImage(segmentationMaskCanvas, 0, 0, segmentationWidth, segmentationHeight, 0, 0, sourcePlayback.width, sourcePlayback.height);
    }
    function blurBackground() {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.filter = 'blur(8px)'; // FIXME Does not work on Safari
        ctx.drawImage(sourcePlayback.htmlElement, 0, 0);
    }
    function drawBackground() {
        if (!backgroundConfig.htmlElement) return;
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(backgroundConfig.htmlElement, 0, 0, sourcePlayback.width, sourcePlayback.height);
    }

    return { render, updatePostProcessingConfig, updateBackgroundConfig, cleanUp };
}
