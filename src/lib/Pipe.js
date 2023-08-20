class Pipe {
    useWriter() {
        return data => {
            setTimeout(() => {
                if (this.cb) {
                    this.cb(data);
                }
            });
        };
    }

    useOnReceive() {
        return func => {
            this.cb = func;
        }
    }
}

export default Pipe;
