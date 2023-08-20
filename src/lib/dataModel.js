import axios from 'axios';
import Pipe from "./Pipe";
import TwoWayPipe from "./TwoWayPipe";

const prefix = '/api';
const sessionKeyName = 'podmanman_key';
let loginKey = sessionStorage.getItem(sessionKeyName);

const errors = {
    errNoLogin: new Error('not logged in'),
    errWebsocket: new Error('cannot connect websocket')
}

const cacheInspect = {};


const login = (username, password) => {
    return axios.post(prefix + '/login', {
        username: username,
        password: password
    })
        .then(resp => {
            loginKey = resp.data.key;
            sessionStorage.setItem(sessionKeyName, loginKey);
        });
};

const containerList = (abortController) => {
    if (!loginKey) {
        return Promise.reject(errors.errNoLogin);
    }
    return axios.get(prefix + '/container', {
        signal: abortController.signal,
        headers: {
            Authorization: 'Bearer ' + loginKey
        }
    })
        .then(resp => resp.data)
};

const containerInspect = (containerId, readCache, abortController) => {
    if (!loginKey) {
        return Promise.reject(errors.errNoLogin);
    }

    if (readCache && cacheInspect[containerId]) {
        return Promise.resolve(cacheInspect[containerId].data);
    }

    return axios.get(prefix + '/container/' + containerId + '/inspect', {
        signal: abortController.signal,
        headers: {
            Authorization: 'Bearer ' + loginKey
        }
    })
        .then(resp => {
            if (resp.data) {
                if (cacheInspect[containerId]) {
                    // data is replaced
                    clearTimeout(cacheInspect[containerId].timeout)
                }

                cacheInspect[containerId] = {
                    data: resp.data,
                    timeout: setTimeout(() => {
                        delete cacheInspect[containerId];
                    }, 5000)
                };
            }
            return resp.data;
        })
};

const containerLogs = (containerId, logOpts) => {
    if (!loginKey) {
        return Promise.reject(errors.errNoLogin);
    }

    logOpts = Object.assign({
        follow: false,
        tail: true,
        tailNum: 1000
    }, logOpts);

    let protocol = 'ws:';
    if (window.location.protocol === 'https:') {
        protocol = 'wss:'
    }
    let url = protocol + '//' + window.location.host + prefix + '/container/' + containerId + '/logs';

    const q = new URLSearchParams();
    if (logOpts.follow) {
        q.set('follow', '1');
    }
    if (logOpts.tail) {
        q.set('tail', logOpts.tailNum);
    }
    const queryStr = q.toString();
    if (queryStr) {
        url += '?' + queryStr;
    }

    const ws = new WebSocket(url);
    const canceler = () => {
        // console.log('dm: ws close while handshaking')
        ws.close(1000, 'canceled');
    };

    return [new Promise((resolve, reject) => {
        const msgPipe = new Pipe();
        const msgWriter = msgPipe.useWriter();

        const closePipe = new Pipe();
        let closeNotified = false;
        const closeWriter = d => {
            if (closeNotified) {
                return;
            }

            const closeWriter = closePipe.useWriter();
            closeWriter(d)
        }

        let open = false;
        let errClosed = false;
        ws.addEventListener('message', event => {
            msgWriter(event.data);
        });
        ws.addEventListener('open', () => {
            ws.send(loginKey);

            open = true;
            resolve({
                onReceive: msgPipe.useOnReceive(),
                onClose: closePipe.useOnReceive(),
                close: () => {
                    // console.log('dm: ws close now')
                    ws.close(1000, 'user terminated the session');
                }
            });
        });
        ws.addEventListener('error', event => {
            if (!open) {
                reject(errors.errWebsocket);
                return;
            }
            ws.close();
            closeWriter({code: -1, reason: 'websocket error'});
            errClosed = true;
        });
        ws.addEventListener('close', event => {
            if (errClosed) {
                return;
            }
            const {code, reason} = event;
            ws.close();
            closeWriter({code, reason});
        });
    }), canceler];
};

const containerExec = (containerId, execOpts) => {
    if (!loginKey) {
        return Promise.reject(errors.errNoLogin);
    }

    let protocol = 'ws:';
    if (window.location.protocol === 'https:') {
        protocol = 'wss:'
    }
    let url = protocol + '//' + window.location.host + prefix + '/container/' + containerId + '/exec';

    const q = new URLSearchParams();
    q.set('cmd', execOpts.cmd);
    if (execOpts.tty) {
        q.set('tty', '1');
    }
    if (execOpts.interactive) {
        q.set('interactive', '1');
    }
    url += '?' + q.toString();

    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    const canceler = () => {
        // console.log('dm: ws close while handshaking')
        ws.close(1000, 'canceled');
    };

    return [new Promise((resolve, reject) => {
        const twoWayPipe = new TwoWayPipe();

        // xterm (left side) <==========> (right side) websocket

        const leftSide = twoWayPipe.useLeft();
        const rightSide = twoWayPipe.useRight();
        const rightSideWriter = rightSide.useWriter();
        const rightSideOnReceive = rightSide.useOnReceive();

        const closePipe = new Pipe();
        const closeWriter = closePipe.useWriter();

        let open = false;
        let errClosed = false;
        ws.addEventListener('message', event => {
            rightSideWriter(event.data);
        });
        ws.addEventListener('open', () => {
            ws.send(loginKey);

            open = true;
            resolve({
                onReceive: leftSide.useOnReceive(),
                write: leftSide.useWriter(),
                onClose: closePipe.useOnReceive(),
                close: () => {
                    // console.log('dm: ws close now')
                    ws.close(1000, 'user terminated the session');
                }
            });

            rightSideOnReceive(d => ws.send(d));
        });
        ws.addEventListener('error', event => {
            if (!open) {
                reject(errors.errWebsocket);
                return;
            }
            ws.close()
            closeWriter({code: -1, reason: 'websocket error'});
            errClosed = true;
        });
        ws.addEventListener('close', event => {
            if (errClosed) {
                return;
            }
            const {code, reason} = event;
            ws.close();
            closeWriter({code, reason});
        });
    }), canceler];
};

const dataModel = {
    errIsNoLogin: e => {
        if (e.response && e.response.status === 401) {
            return true;
        }
        if (e === errors.errNoLogin) {
            return true;
        }
        return false;
    },

    login,
    containerList,
    containerInspect,
    containerLogs,
    containerExec
};

export default dataModel;
