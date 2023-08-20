import Pipe from "./Pipe";

class Side {
    constructor(writer, onReceive) {
        this.writerFunc = writer;
        this.onReceiveFunc = onReceive;
    }

    useWriter() {
        return d => this.writerFunc(d);
    }

    useOnReceive() {
        return f => this.onReceiveFunc(f);
    }
}

class TwoWayPipe {
    constructor() {
        const p1 = new Pipe();
        const p2 = new Pipe();

        this.left = new Side(p1.useWriter(), p2.useOnReceive());
        this.right = new Side(p2.useWriter(), p1.useOnReceive());
    }

    useLeft() {
        return this.left;
    }

    useRight() {
        return this.right;
    }
}

export default TwoWayPipe;
