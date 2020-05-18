import { Injectable } from '@angular/core';

import * as mediasoupClient from 'mediasoup-client';
import { pluck, map } from 'rxjs/operators';

import { CreateWebRtcGQL, ConnectedWebRtcGQL } from '@graphql/mutation.service';

const device = new mediasoupClient.Device();

@Injectable({providedIn: 'root'})
export class WebrtcService {
    mimeType: string;
    ws: WebSocket;

    constructor(
        private readonly _createWebRtc: CreateWebRtcGQL,
        private readonly _connectedWebRtc: ConnectedWebRtcGQL
    ) { }

    init(video: HTMLVideoElement, playbackVideo: HTMLVideoElement, mimeType?: string): void {
        this.mimeType = mimeType;

        let transport: mediasoupClient.types.Transport;
        let ws: WebSocket;

        try {
            this.ws = ws = new WebSocket('ws://10.0.0.195:8888');
        } catch (err) {
            throw err;
        }

        let callback: any;
        let errback: any;

        ws.onopen = () => {
            const msg = JSON.stringify({
                type: 'initTransport'
            });

            ws.send(msg);
        };

        ws.onmessage = async (msg) => {
            try {
                msg = JSON.parse(msg.data);
            } catch (err) {
                throw err;
            }
            if (msg.type === 'initTransport') {
                log('local:initTransport:', msg);

                const res = await _initTransport(msg.data);
            }

            if (msg.type === 'connect') {
                log('local:connect:', msg);

                callback();
            }

            if (msg.type === 'initConsumer') {
                log('local:initConsumer:', msg);

                const promise = _initConsumer.call(this, msg.data);
            }

            if (msg.type === 'finish') {
                log('local:finish');

                (window as any).__player__ = video;

                // const promise = video.play().then(() => {
                //     log('开始播放');
                // });
            }
        };

        ws.onclose = () => {
            log('local:close');

            transport?.close();
        };

        // tslint:disable-next-line: max-line-length
        async function _initConsumer(data: { producerId: any; id: any; kind: any; rtpParameters: any; type: any; appData: any; producerPaused: any; }): Promise<any> {
            const {
                producerId,
                id,
                kind,
                rtpParameters,
                type,
                appData,
                producerPaused
            } = data;

            let codecOptions: { opusStereo: number; };

            if (kind === 'audio') {
                codecOptions = {
                    opusStereo : 1
                };
            }

            try {
                const consumer = await transport.consume(
                    {
                        id,
                        producerId,
                        kind,
                        rtpParameters,
                        appData : { ...appData } // Trick.
                    });

                // _bindVideoElement(consumer);
                this._bindVideoElement(video, playbackVideo, consumer);

            } catch (err) {
                console.error(err);
            }
        }

        function _bindVideoElement(consumer: { track: MediaStreamTrack; }): void {
            const stream = new MediaStream([ consumer.track ]);

            (window as any).__track__ = consumer.track;
            (window as any).__stream0__ = stream;

            video.srcObject = stream;
            log('绑定成功');

            const data = JSON.stringify({
                type: 'finish'
            });

            ws.send(data);
        }

        // tslint:disable-next-line: max-line-length
        async function _initTransport(data: { id: any; iceParameters: any; iceCandidates: any; dtlsParameters: any; sctpParameters: any; routerRtpCapabilities: any; }): Promise<any> {
            const {
                id,
                iceParameters,
                iceCandidates,
                dtlsParameters,
                sctpParameters,
                routerRtpCapabilities
            } = data;

            await device.load({
                routerRtpCapabilities
            });

            log('device loded');

            transport = device.createRecvTransport({
                id,
                iceParameters,
                iceCandidates,
                dtlsParameters,
                sctpParameters,
                iceServers : []
            });

            log('本地对等连接状态:', transport.connectionState);

            const sendData = JSON.stringify({
                type: 'initConsumer'
            });

            ws.send(sendData);

            transport.on(
                // tslint:disable-next-line: no-shadowed-variable
                'connect', ({ dtlsParameters }: any, callback2: any, errback2: any) => {
                    callback = callback2;
                    errback = errback2;

                    log('local:connect');

                    // tslint:disable-next-line: no-shadowed-variable
                    const data = JSON.stringify({
                        type: 'connect',
                        data: {
                            transportId : transport.id,
                            dtlsParameters
                        }
                    });

                    ws.send(data);
                });
            }
    }

    private _bindVideoElement(
        mediaElement: HTMLMediaElement,
        playbackVideo: HTMLMediaElement,
        consumer?: { track: MediaStreamTrack; }
    ): void {
        const { track: audioTrack } = this._getAudioTrack();
        const stream = new MediaStream([ consumer.track, audioTrack ]);

        mediaElement.srcObject = stream;

        (window as any).__track__ = consumer.track;
        (window as any).__stream0__ = stream;
        log('consumer:', consumer);

        const mediaSource = new MediaSource();
        this._handleMediaSource(mediaSource, stream, mediaElement);

        playbackVideo.src = URL.createObjectURL(mediaSource);
        log('绑定视频流成功');

        const data = JSON.stringify({
            type: 'finish'
        });

        this.ws.send(data);

        // (window as any).navigator.mediaDevices.getDisplayMedia()
        //     .then(stream => {
        //         // mediaElement.srcObject = stream;
        //         // mediaElement.play();

        //         const mediaSource = (window as any).__mediaSource__ = new MediaSource();
        //         this._handleMediaSource(mediaSource, stream);

        //         mediaElement.src = URL.createObjectURL(mediaSource);
        //         log('绑定视频流成功');
        //     });
    }

    private _getAudioTrack(): {track: MediaStreamTrack, oscillator: OscillatorNode} {
        const audioContext = new AudioContext();
        const destinationNode = audioContext.createMediaStreamDestination();
        const oscillator = audioContext.createOscillator();

        oscillator.frequency.setValueAtTime(0, audioContext.currentTime);
        oscillator.connect(destinationNode);
        oscillator.start(0);

        return {
            track: destinationNode.stream.getAudioTracks()[0],
            oscillator
        };
    }

    private _handleMediaSource(
        mediaSource: MediaSource,
        stream: MediaStream,
        liveVideo: HTMLMediaElement,
        oscillator?: OscillatorNode
    ): void {
        let sourceBuffer: SourceBuffer;
        const mediaRecorder = new (window as any).MediaRecorder(stream, this.mimeType ? {mimeType: this.mimeType} : void(0));

        mediaSource.onsourceopen = e => {
            log('onsourceopen');
            log('recorder-mimeType:', mediaRecorder.mimeType);
            sourceBuffer = (window as any).__sourceBuffer__ = mediaSource.addSourceBuffer(mediaRecorder.mimeType);

            this._handleMediaRecorder(mediaRecorder, sourceBuffer, liveVideo);
            mediaRecorder.start();
        };

        mediaSource.onsourceended = e => {
            log('mediaSource结束');
            mediaRecorder.stop();
        };

        mediaSource.onsourceclose = e => {
            log('mediaSource关闭');
            mediaRecorder.stop();
        };
    }

    private _handleMediaRecorder(
        mediaRecorder: any,
        sourceBuffer: SourceBuffer,
        liveVideo: HTMLMediaElement,
        oscillator?: OscillatorNode
    ): void {
        mediaRecorder.onstart = () => {
            log('开始录制');

            // 触发'ondataavailable'
            setTimeout(() => {
                mediaRecorder.requestData();
            }, 1000);
        };

        mediaRecorder.onresume = () => {
            log('重新开始录制');
        };

        mediaRecorder.onstop = () => {
            log('停止录制');
        };

        mediaRecorder.onpause = () => {
            log('暂停录制');
        };

        mediaRecorder.omerror = err => {
            log('录制发生错误');
            console.error(err);
        };

        mediaRecorder.ondataavailable = e => {
            log('recording');

            this._cleanupBuffer(sourceBuffer, liveVideo);

            e.data.arrayBuffer()
            .then((arrayBuffer: ArrayBuffer) => {
                if (arrayBuffer.byteLength > 0) {
                    sourceBuffer.appendBuffer(arrayBuffer);
                    log('arrayBuffer:', arrayBuffer);
                }
                setTimeout(() => {
                    mediaRecorder.requestData();
                }, 1000);
            });
        };
    }

    private _cleanupBuffer(sb: SourceBuffer, liveVideo: HTMLMediaElement): void {
        const timeRanges = sb.buffered;

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < timeRanges.length; i++) {
            const start = timeRanges.start(i);
            const end = timeRanges.end(i);

            log('start:', start);
            log('end:', end);

            // 当回放视频时，不清除缓存，因为回放时允许拖放进度条
            // 保存30秒的数据, 用于回放
            if (!liveVideo.paused && end - start > (31 + 3) /*延迟3秒*/ && !sb.updating) {
                sb.remove(start, end - 31 /* 多保存1秒, 防止回放30秒时出错 */);

                log(`清理缓存 start: ${start}, end: ${end - 31}, 剩余持续时间: 31`);
            }

        }
    }
}
