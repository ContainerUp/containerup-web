import {Alert} from "@mui/material";

export default function WebsocketConnectError() {
    return (
        <Alert severity="error">
            Failed to connect websocket.
        </Alert>
    );
}