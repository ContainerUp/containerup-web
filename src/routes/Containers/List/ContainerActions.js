import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Menu, MenuItem,
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveIcon from '@mui/icons-material/Save';
import {useEffect, useState} from "react";
import dataModel from "../../../lib/dataModel";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ActionCommitDialog from "./ActionCommitDialog";

export default function ContainerActions({c}) {
    const navigate = useNavigate();

    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const menuOpen = Boolean(menuAnchorEl);

    const [dialogRemoveOpen, setDialogRemoveOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const [actionTarget, setActionTarget] = useState({Names: ['']});
    const [actioning, setActioning] = useState(false);

    const [dialogCommitOpen, setDialogCommitOpen] = useState(false);

    const [showAlert, setShowAlert] = useState(false);
    const [actionErr, setActionErr] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [success, setSuccess] = useState({name: '', action: ''});

    const handleClickMenuButton = event => {
        setMenuAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
    }

    const handleRemoveDialogClose = () => {
        setDialogRemoveOpen(false);
    };

    const handleRemoveDialogConfirm = () => {
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
                    setMenuAnchorEl(null);
                    setActionType('remove');
                    setActionTarget(c);
                    setDialogRemoveOpen(true);
                };
            }

            case 'commit': {
                return () => {
                    setMenuAnchorEl(null);
                    setDialogCommitOpen(true);
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
        dataModel.containerAction(actionTarget.idShort, {
            action: actionType
        }, ac)
            .then(() => {
                setDialogRemoveOpen(false);
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
                setSuccess({
                    name: actionTarget.Names[0],
                    action: actionTypeText
                });
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
    }, [actioning, actionTarget, actionType, navigate]);

    const canStart = !actioning && (c.State === 'exited' || c.State === 'created');
    const canStop = !actioning && (c.State === 'running');
    const canExec = !actioning && (c.State === 'running');
    const canDelete = !actioning && (c.State === 'exited' || c.State === 'created');

    return (
        <>
            <Dialog
                open={dialogRemoveOpen}
                onClose={handleRemoveDialogClose}
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
                    <Button onClick={handleRemoveDialogClose} autoFocus disabled={actioning}>
                        Cancel
                    </Button>
                    <Button onClick={handleRemoveDialogConfirm} disabled={actioning} color="warning">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>

            <ActionCommitDialog
                open={dialogCommitOpen}
                container={c}
                onClose={() => setDialogCommitOpen(false)}
            />

            <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleAlertClose}>
                <Alert severity="error" onClose={handleAlertClose}>{actionErr}</Alert>
            </Snackbar>

            <Snackbar open={showSuccess} autoHideDuration={5000} onClose={handleSuccessClose}>
                <Alert severity="success" onClose={handleSuccessClose}>
                    Container <b>{success.name}</b> {success.action}.
                </Alert>
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

            <Tooltip title="More actions">
                <IconButton
                    aria-label="more actions"
                    onClick={handleClickMenuButton}
                    color="primary"
                >
                    <MoreVertIcon />
                </IconButton>
            </Tooltip>
            <Menu
                id="basic-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem
                    disabled={!canDelete}
                    onClick={handleClickAction(c, 'commit')}
                >
                    <ListItemIcon>
                        <SaveIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        Commit
                    </ListItemText>
                </MenuItem>

                <MenuItem
                    disabled={!canDelete}
                    onClick={handleClickAction(c, 'remove')}
                >
                    <ListItemIcon sx={{color: orange[300]}}>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        Remove
                    </ListItemText>
                </MenuItem>

            </Menu>
        </>
    );
}