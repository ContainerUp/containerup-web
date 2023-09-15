import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar
} from "@mui/material";
import {useEffect, useState} from "react";
import TextField from "@mui/material/TextField";
import dataModel from "../../../lib/dataModel";
import {useNavigate} from "react-router-dom";

export default function ActionCommitDialog({open, container, onClose}) {
    const navigate = useNavigate();
    const [actioning, setActioning] = useState(false);
    const [tag, setTag] = useState('');
    const [submitTimes, setSubmitTimes] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [actionErr, setActionErr] = useState('');

    const handleDialogClose = () => {
        onClose();
    }

    const handleDialogForceClose = () => {
        if (actioning) {
            return;
        }
        handleDialogClose();
    };

    const handleDialogConfirm = () => {
        if (!tag) {
            setSubmitTimes(v => v + 1);
            return;
        }
        setSubmitTimes(0);
        setActioning(true);
    }

    const handleAlertClose = () => {
        setShowAlert(false);
    }
    const handleSuccessClose = () => {
        setShowSuccess(false);
    }

    useEffect(() => {
        if (!actioning) {
            return;
        }

        const ac = new AbortController();
        dataModel.containerAction(container.idShort, {
            action: 'commit',
            repoTag: tag
        }, ac)
            .then(() => {
                onClose();
                setShowSuccess(true);
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
    }, [actioning, container, navigate, onClose, tag]);

    return (
        <>
            <Dialog
                open={open}
                onClose={handleDialogForceClose}
                aria-labelledby="alert-dialog-title-commit"
                aria-describedby="alert-dialog-description-commit"
                disableRestoreFocus
            >
                <DialogTitle id="alert-dialog-title-commit">
                    Commit container
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-commit">
                        Commit the container <b>{container.Names[0]}</b> ({container.idShort}) to an image.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Repository[:Tag]"
                        fullWidth
                        size="small"
                        value={tag}
                        onChange={event => {setTag(event.target.value)}}
                        sx={{marginTop: '12px'}}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleDialogConfirm();
                            }
                        }}
                        disabled={actioning}
                        error={submitTimes > 0 && tag === ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} disabled={actioning}>
                        Cancel
                    </Button>
                    <Button onClick={handleDialogConfirm} disabled={actioning}>
                        Commit
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleAlertClose}>
                <Alert severity="error" onClose={handleAlertClose}>{actionErr}</Alert>
            </Snackbar>

            <Snackbar open={showSuccess} autoHideDuration={5000} onClose={handleAlertClose}>
                <Alert severity="success" onClose={handleSuccessClose}>
                    Container <b>{container.Names[0]}</b> ({container.idShort}) has been committed to an image with tag <b>{tag}</b>.
                </Alert>
            </Snackbar>
        </>
    );
};
