import React from 'react';
import { buildCanvas2dPipeline } from '../../pipelines/canvas2d/canvas2dPipeline';
import { getTfLite } from '../../core/helpers/getTfLite';
import { useEffect, useState } from 'react';

function Test(params) {
    let renderRequestId;
    let c = 0;

    useEffect(() => {
        const promise = navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: '9536a059fbfcaa1687ff7092e95823edd7568c12ec5224f9c443dd215aab58df'
            }
        });

        let cleanUp = () => { };
        let renderIt = async () => { };
        let updatePostProcessingConfig = () => { };

        getTfLite('160x96').then(async ([tflite, simd]) => {
            const stream = await promise;
            const { width, height } = stream.getVideoTracks()[0].getSettings();

            const video = document.getElementById('video');
            video.srcObject = stream;

            const canvas = document.getElementById('canvas');
            canvas.width = width;
            canvas.height = height;

            document.getElementById('overlay').style.top = `-${height / 2}px`;

            const data = buildCanvas2dPipeline({
                type: 'camera',
                htmlElement: video,
                width,
                height,
            }, { type: 'image' }, { inputResolution: '160x96' }, document.getElementById('canvas'), tflite);

            cleanUp = data.cleanUp;
            renderIt = data.render;
            updatePostProcessingConfig = data.updatePostProcessingConfig;

            updatePostProcessingConfig({
                smoothSegmentationMask: true,
            });
        });

        async function render() {
            await renderIt();
            renderRequestId = requestAnimationFrame(render);
        }
        render();

        return () => {
            cleanUp();
            cancelAnimationFrame(renderRequestId);
        };
    }, []);


    return (
        <>
            <video id='video' className='-none' autoPlay={true}></video>
            <div><canvas id='canvas'></canvas>
                <div id='overlay' style={{ position: 'relative' }}>{c}</div>
            </div>
        </>
    );
}

export default Test;