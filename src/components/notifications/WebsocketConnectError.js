import {Button} from "@mui/material";
import {enqueueSnackbar} from "notistack";

export default function WebsocketConnectError() {
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