import {useEffect, useRef} from "react";
import {Box} from "@mui/material";
import {Terminal} from "xterm";
import { FitAddon } from 'xterm-addon-fit';

export default function MyTerminal({writerOnReceive}) {
    const ref = useRef();

    useEffect(() => {
        if (!writerOnReceive) {
            return () => {};
        }

        const xterm = new Terminal({
            fontSize: 13
        });
        const fitAddon = new FitAddon()
        xterm.loadAddon(fitAddon);
        xterm.open(ref.current);
        fitAddon.fit();
        writerOnReceive(data => xterm.write(data));

        const handleResize = () => {
            fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            writerOnReceive(null);
            xterm.dispose();
            window.removeEventListener('resize', handleResize);
        };
    });

    return (
        <Box ref={ref} sx={{height: '100%'}}>
        </Box>
    );
}