import React from 'react';
import useTFLite from '../../hooks/useTFLite';
import useRenderingPipeline from '../../hooks/useRenderingPipeline';
import { useState } from 'react';

function Test(params) {
    navigator.mediaDevices.getUserMedia({
        video: true
    }).then((stream) => {
        const video = document.getElementById('video');
        video.srcObject = stream;
    });
    const { tflite, isSIMDSupported } = useTFLite({
        model: 'meet',
        backend: 'wasm',
        inputResolution: '160x96',
        pipeline: 'webgl2',
    });

    const { pipeline, backgroundImageRef, canvasRef, fps, durations: [resizingDuration, inferenceDuration, postProcessingDuration], } = useRenderingPipeline({
        type: 'camera',
        htmlElement: document.getElementById('video'),
        width: 640,
        height: 480,
    }, {
        type: 'blue'
    }, {
        model: 'meet',
        backend: isSIMDSupported ? 'wasmSimd' : 'wasm',
        inputResolution: '160x96',
        pipeline: 'webgl2',
    }, null, tflite);


    return (
        <video id="video" width={640} height={480}></video>
    );
}

export default Test;