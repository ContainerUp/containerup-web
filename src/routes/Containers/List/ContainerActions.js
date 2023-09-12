import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Tooltip
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {blue, green, grey, orange, red} from "@mui/material/colors";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import SubjectIcon from "@mui/icons-material/Subject";
import TerminalIcon from "@mui/icons-material/Terminal";
import DeleteIcon from "@mui/icons-material/Delete";
import {useEffect, useState} from "react";
import dataModel from "../../../lib/dataModel";

export default function ContainerActions({c, onUpdated}) {
    const canStart = c.State === 'exited' || c.State === 'created';
    const canStop = c.State === 'running';
    const canExec = c.State === 'running';
    const canDelete = c.State === 'exited' || c.State === 'created';

    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const [actionTarget, setActionTarget] = useState({Names: ['']});
    const [actioning, setActioning] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [actionErr, setActionErr] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successText, setSuccessText] = useState('');

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleDialogConfirm = () => {
        setActioning(true);
    }

    const handleAlertClose = () => {
        setShowAlert(false);
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
    };

    const handleClickAction = (c, action) => {
        switch (action) {
            case 'start': {
                return () => {
                    setActionType('start');
                    setActionTarget(c);
                    setActioning(true);
                };
            }

            case 'stop': {
                return () => {
                    setActionType('stop');
                    setActionTarget(c);
                    setActioning(true);
                };
            }

            case 'remove': {
                return () => {
                    setActionType('remove');
                    setActionTarget(c);
                    setDialogOpen(true);
                };
            }

            default:
                return null;
        }
    };

    useEffect(() => {
        if (!actioning) {
            return;
        }

        const ac = new AbortController();
        dataModel.containerAction(actionTarget.idShort, actionType, ac)
            .then(() => {
                setDialogOpen(false);
                onUpdated();
                setShowSuccess(true);

                let actionTypeText = '';
                switch (actionType) {
                    case 'start': {
                        actionTypeText = 'started';
                        break;
                    }
                    case 'remove': {
                        actionTypeText = 'removed';
                        break;
                    }
                    case 'stop': {
                        actionTypeText = 'stopped';
                        break;
                    }
                    default:
                }
                setSuccessText(`Container ${actionTarget.idShort} ${actionTypeText}.`);
            })
            .catch(err => {
                if (ac.signal.aborted) {
                    return;
                }
                if (dataModel.errIsNoLogin(err)) {
                    let query = new URLSearchParams();
                    query.append('cb', '/containers')
                    navigate('/login?' + query.toString());
                    return;
                }
                setShowAlert(true);
                let errStr = err.toString();
                if (err.response) {
                    errStr = err.response.data;
                }
                setActionErr(errStr);
            })
            .finally(() => {
                if (ac.signal.aborted) {
                    return;
                }
                setActioning(false);
            });

        return () => ac.abort();
    }, [actioning, actionTarget, actionType, onUpdated, navigate]);

    return (
        <>
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title-rm"
                aria-describedby="alert-dialog-description-rm"
            >
                <DialogTitle id="alert-dialog-title-rm">
                    Remove container
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-rm">
                        Do you really want to remove <b>{actionTarget.Names[0]}</b> ({actionTarget.idShort})? <br />
                        This container will be removed permanently. You cannot undo this action.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} autoFocus disabled={actioning}>
                        Cancel
                    </Button>
                    <Button onClick={handleDialogConfirm} disabled={actioning} color="warning">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleAlertClose}>
                <Alert severity="error" onClose={handleAlertClose}>{actionErr}</Alert>
            </Snackbar>

            <Snackbar open={showSuccess} autoHideDuration={5000} onClose={handleSuccessClose}>
                <Alert severity="success" onClose={handleSuccessClose}>{successText}</Alert>
            </Snackbar>

            {canStart ? (
                <Tooltip title="Start">
                    <IconButton
                        aria-label="start"
                        sx={{color: green[500]}}
                        onClick={handleClickAction(c, 'start')}
                    >
                        <PlayArrowIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Start">
                    <span>
                        <IconButton
                            aria-label="start"
                            sx={{color: green[500]}}
                            disabled
                        >
                            <PlayArrowIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            )}

            {canStop ? (
                <Tooltip title="Stop">
                    <IconButton
                        aria-label="stop"
                        sx={{color: red[900]}}
                        onClick={handleClickAction(c, 'stop')}
                    >
                        <StopIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Stop">
                    <span>
                        <IconButton
                            aria-label="stop"
                            sx={{color: red[900]}}
                            disabled
                        >
                            <StopIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            )}

            <Tooltip title="Logs">
                <IconButton
                    aria-label="logs"
                    sx={{color: blue[300]}}
                    component={RouterLink} to={c.idShort + '/logs'}
                >
                    <SubjectIcon />
                </IconButton>
            </Tooltip>

            {canExec ? (
                <Tooltip title="Exec">
                    <IconButton
                        aria-label="exec"
                        sx={{color: grey[800]}}
                        component={RouterLink}
                        to={c.idShort + '/exec'}
                    >
                        <TerminalIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Exec">
                    <span>
                        <IconButton
                            aria-label="exec"
                            sx={{color: grey[800]}}
                            disabled
                        >
                            <TerminalIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            )}

            {canDelete ? (
                <Tooltip title="Remove">
                    <IconButton
                        aria-label="remove"
                        sx={{color: orange[300]}}
                        onClick={handleClickAction(c, 'remove')}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Remove">
                    <span>
                        <IconButton
                            aria-label="remove"
                            sx={{color: orange[300]}}
                            disabled
                        >
                            <DeleteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
        </>
    );
}