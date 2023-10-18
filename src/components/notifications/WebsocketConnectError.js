import {Button} from "@mui/material";
import {enqueueSnackbar} from "notistack";

export default function showWebsocketConnectError() {
    const action = (
        <Button
            size="small"
            color="inherit"
            href="https://containerup.org/faq/#cannot-connect-to-websocket"
            target="_blank"
        >
            Troubleshoot!
        </Button>
    );

    return enqueueSnackbar('Cannot connect to WebSocket.', {
        variant: 'error',
        persist: true,
        action
    });
}