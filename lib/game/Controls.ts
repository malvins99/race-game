export class Controls {
    up: boolean = false;
    down: boolean = false;
    left: boolean = false;
    right: boolean = false;
    nos: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keydown', this.onKeyDown.bind(this), false);
            document.addEventListener('keyup', this.onKeyUp.bind(this), false);
        }
    }

    onKeyDown(ev: KeyboardEvent) {
        switch (ev.key) {
            case 'ArrowUp': case 'w': this.up = true; break;
            case 'ArrowDown': case 's': this.down = true; break;
            case 'ArrowLeft': case 'a': this.left = true; break;
            case 'ArrowRight': case 'd': this.right = true; break;
            case 'q': case 'Q': this.nos = true; break;
        }
    }

    onKeyUp(ev: KeyboardEvent) {
        switch (ev.key) {
            case 'ArrowUp': case 'w': this.up = false; break;
            case 'ArrowDown': case 's': this.down = false; break;
            case 'ArrowLeft': case 'a': this.left = false; break;
            case 'ArrowRight': case 'd': this.right = false; break;
            case 'q': case 'Q': this.nos = false; break;
        }
    }
}
