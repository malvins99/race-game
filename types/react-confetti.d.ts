declare module 'react-confetti' {
    import { Component } from 'react';

    export interface ConfettiProps {
        width: number;
        height: number;
        numberOfPieces?: number;
        recycle?: boolean;
        wind?: number;
        gravity?: number;
        initialVelocityX?: number;
        initialVelocityY?: number;
        colors?: string[];
        opacity?: number;
    }

    export default class Confetti extends Component<ConfettiProps> { }
}
