import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'notadd-video-volume-control',
    templateUrl: './volume-control.component.html',
    styleUrls: ['./volume-control.component.scss']
})
export class VolumeControlComponent implements OnInit {

    @Input() disabled: boolean;
    @Input() volume: number;

    @Output() readonly volumeChanged: EventEmitter<number>;

    private _muted: boolean;
    @Input()
    get muted(): boolean { return this._muted; }
    set muted(value: boolean) {
        this._muted = value;
    }

    @Output() readonly mutedChanged: EventEmitter<boolean>;

    constructor() {
        this.volumeChanged = new EventEmitter<number>();
        this.muted = false;
        this.mutedChanged = new EventEmitter<boolean>();
    }

    ngOnInit(): void {
    }

    setVolume(value: number): void {
        this.volumeChanged.emit(value);

        if (value > 0) {
            this.setMuted(false);
        } else {
            this.muted = true;
        }
    }

    setMuted(value: boolean): void {
        if (this.muted !== value) {
            this.toggleMuted();
        }
    }

    toggleMuted(): void {
        if (this.disabled) {
            return;
        }
        this.muted = !this.muted;
        this.mutedChanged.emit(this.muted);
    }

}
