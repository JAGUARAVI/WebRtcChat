import { useEffect, useRef, useState } from 'react';
import { buildCanvas2dPipeline } from '../pipelines/canvas2d/canvas2dPipeline';
import { buildWebGL2Pipeline } from '../pipelines/webgl2/webgl2Pipeline';
function useRenderingPipeline(sourcePlayback, backgroundConfig, segmentationConfig, bodyPix, tflite) {
    const [pipeline, setPipeline] = useState(null);
    const backgroundImageRef = useRef(null);
    const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);
    const [durations, setDurations] = useState([]);
    useEffect(() => {
        // The useEffect cleanup function is not enough to stop
        // the rendering loop when the framerate is low
        let shouldRender = true;
        let previousTime = 0;
        let beginTime = 0;
        let eventCount = 0;
        let frameCount = 0;
        const frameDurations = [];
        let renderRequestId;
        const newPipeline = segmentationConfig.pipeline === 'webgl2'
            ? buildWebGL2Pipeline(sourcePlayback, backgroundImageRef.current, backgroundConfig, segmentationConfig, canvasRef.current, tflite, addFrameEvent)
            : buildCanvas2dPipeline(sourcePlayback, backgroundConfig, segmentationConfig, canvasRef.current, bodyPix, tflite, addFrameEvent);
        async function render() {
            if (!shouldRender) {
                return;
            }
            beginFrame();
            await newPipeline.render();
            endFrame();
            renderRequestId = requestAnimationFrame(render);
        }
        function beginFrame() {
            beginTime = Date.now();
        }
        function addFrameEvent() {
            const time = Date.now();
            frameDurations[eventCount] = time - beginTime;
            beginTime = time;
            eventCount++;
        }
        function endFrame() {
            const time = Date.now();
            frameDurations[eventCount] = time - beginTime;
            frameCount++;
            if (time >= previousTime + 1000) {
                setFps((frameCount * 1000) / (time - previousTime));
                setDurations(frameDurations);
                previousTime = time;
                frameCount = 0;
            }
            eventCount = 0;
        }
        render();
        console.log('Animation started:', sourcePlayback, backgroundConfig, segmentationConfig);
        setPipeline(newPipeline);
        return () => {
            shouldRender = false;
            cancelAnimationFrame(renderRequestId);
            newPipeline.cleanUp();
            console.log('Animation stopped:', sourcePlayback, backgroundConfig, segmentationConfig);
            setPipeline(null);
        };
    }, [sourcePlayback, backgroundConfig, segmentationConfig, bodyPix, tflite]);
    return {
        pipeline,
        backgroundImageRef,
        canvasRef,
        fps,
        durations,
    };
}
export default useRenderingPipeline;
