import {enqueueSnackbar} from "notistack";
import {Button} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';

export function showWebsocketDisconnectError() {
    const action = (
        <Button
            color="inherit"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
        >
            Reload
        </Button>
    );

    return enqueueSnackbar('Websocket disconnected. The information on this page is NOT up-to-date.', {
        variant: 'warning',
        persist: true,
        action
    });
}
