import {
    Component,
    ElementRef,
    Input,
    Output,
    OnInit,
    AfterViewInit,
    EventEmitter,
    Inject,
    ViewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import * as screenfull from 'screenfull';

import { WebrtcService } from './webrtc.service';

@Component({
    selector: 'rtc-video',
    templateUrl: './rtc-video.component.html',
    styleUrls: ['./rtc-video.component.scss'],
})
export class RtcVideoComponent implements OnInit, AfterViewInit {

    @Input() autoplay: boolean;                             // 是否自动播放
    @Input() controlType: 'bottom' | 'middle' = 'bottom';   // 控制按钮的类别
    @Input() zoom = false;                                  // 是否开启拉伸放大
    @Input() fill = false;                                  // 画面是否被拉伸，以充满播放器，如该值为false就按一比一比例显示
    @Input() streamId = 0;                                  // 码流ID

    @Output() readonly playstart = new EventEmitter();      // 播放器成功播放时触发
    @Output() readonly screenshot = new EventEmitter();     // 截图成功时触发
    @Output() readonly stretch = new EventEmitter();        // 拉框时，当鼠标松开时触发
    @Output() readonly videoEnded = new EventEmitter();     // 视频播放结束时触发

    @ViewChild('player') player: ElementRef<HTMLVideoElement>;
    @ViewChild('playbackPlayer') playbackPlayer: ElementRef<HTMLVideoElement>;

    loading = true;
    playing = false;
    playbacking = false;
    stretchBoxWidth = 0;
    stretchBoxHeight = 0;
    stretchBoxTop = 0;
    stretchBoxLeft = 0;
    stretchStart = false;
    countdownFontSize: number;
    volume = 1;
    playbackCountdown: number;
    mimeType = 'video/webm;codecs=opus,vp9';

    private _startTimeOfPlayback = 0;
    private _playbackVideoEndTime = 0;

    private readonly _screenfull = screenfull as screenfull.Screenfull;

    constructor(
        private readonly _elementRef: ElementRef<HTMLElement>,
        private readonly _webrtcService: WebrtcService,
        @Inject(DOCUMENT) private readonly _doc: any,
    ) {}

    get playerWidth(): number {
        return this._elementRef.nativeElement.clientWidth;
    }

    get playerHeight(): number {
        return this._elementRef.nativeElement.clientHeight;
    }

    get isFullscreen(): boolean {
        return this._screenfull.isFullscreen;
    }

    get video(): HTMLVideoElement {
        return this.player?.nativeElement;
    }

    get playbackVideo(): HTMLVideoElement {
        return this.playbackPlayer?.nativeElement;
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this._webrtcService.init(this.video, this.playbackVideo, this.mimeType);
        // (window as any).navigator.mediaDevices.getDisplayMedia()
        //     .then(stream => {
        //         log(stream);
        //         this._stream = stream;
        //         this.video.srcObject = stream;
        //         const p = this.video.play();

        //         // this._startRecorder();
        //     });

    }

    onVideoPlaying(): void {
        log('开始直播');

        if (!this.playbacking) {
            this.playing = true;
        }
        this.loading = false;
    }

    onVideoPause(): void {
        log('暂停直播');
        this.playing = false;
    }

    onVideoEnded(): void {
        this._initState();
    }

    private _initState(): void {
        this.loading = false;
        this.playing = false;
    }

    onVolumeChange(volume: number): void {
        this.video.volume = volume / 100;
    }

    onMuteChange(muted: boolean): void {
        this.video.muted = muted;
    }

    onScreenshotClick(): void {

    }

    onToggleStream(): void {

    }

    onFullscreen(): void {
        const p = this._screenfull.toggle(this._elementRef?.nativeElement);
    }

    onTogglePlay(): void {
        if (this.playing) {
            this.video.pause();
        } else {
            this.playbacking = false;
            this.playbackCountdown = 0;
            this.video.play();
            // .then(() => {
            //     this._jumpToCurrent();
            // });
        }
    }

    formatPlaybackTime(v: number): string {
        return `0:${v}`;
    }

    onChangePlaybackTime({ value }): void {

        // 倒计时的大小不能超过视频的总时长
        if (30 - value <= this._playbackVideoEndTime) {
            this.playbackCountdown = 30 - value;
            this.playbackVideo.currentTime = this._startTimeOfPlayback + value;

            console.log('playback:currentTime:', this.playbackVideo.currentTime);
        }
    }

    // private _jumpToCurrent(): void {
    //     this.video.currentTime = 9999999999;    // 一个较大的数字, 目的是跳转到实时播放
    // }

    async onPlayback(): Promise<void> {
        if (this.playbacking || !this.playing) {
            return;
        }

        try {
            await this.playbackVideo.play();

            log('开始回放');

            // 计算回放的开始时间
            if (this.playbackVideo.seekable.length) {
                this._playbackVideoEndTime = this.playbackVideo.seekable.end(0);

                if (this._playbackVideoEndTime > 30) {
                    this._startTimeOfPlayback = this._playbackVideoEndTime - 30;
                } else {
                    this._startTimeOfPlayback = 0;
                }
            }

            // 使回放视频开始于正确的时间
            this.playbackVideo.currentTime = this._startTimeOfPlayback;

            this._initPlaybackCountdown();

            if (this.video.currentTime <= 30) {
                this.video.currentTime = 0;
            } else {
                this.video.currentTime = this.video.currentTime - 30;   // 回放30秒之前的视频
            }

            this.playbacking = true;
            this.video.pause(); // 回放时暂停直播

            window.setTimeout(() => {
                this._startLoops();
            }, 1000);
        } catch (err) {
            log('回放失败');
            console.error(err);
        }
    }

    private _initPlaybackCountdown(): void {
        const time = this.playbackVideo.seekable.length ? this.playbackVideo.seekable.end(0) : 0;

        if (time <= 30) {
            this.playbackCountdown = Math.floor(time);
        } else {
            this.playbackCountdown = 30;
        }
    }

    private _startLoops(): void {
        this.playbackCountdown--;
        window.setTimeout(() => {
            if (this.playbackCountdown > 0) {
                this._startLoops();
            } else {
                this.playbackVideo.pause();
                console.log('回放结束');
            }
        }, 1000);
    }

}
