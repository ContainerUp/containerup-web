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
import TextField from "@mui/material/TextField";
import {useEffect, useState} from "react";
import dataModel from "../../../lib/dataModel";
import {useNavigate} from "react-router-dom";

export default function ImageActionTag({open, img, onClose}) {
    const navigate = useNavigate();
    const [tag, setTag] = useState('');
    const [submitTimes, setSubmitTimes] = useState(0);
    const [actioning, setActioning] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [actionErr, setActionErr] = useState('');

    const handleDialogClose = () => {
        onClose(false);
        setTag('');
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

    useEffect(() => {
        if (!actioning) {
            return;
        }

        const ac = new AbortController();
        dataModel.imageAction(img.idShort, {
            action: 'tag',
            repoTag: tag
        }, ac)
            .then(() => {
                onClose(tag);
                setTag('');
            })
            .catch(err => {
                if (ac.signal.aborted) {
                    return;
                }
                if (dataModel.errIsNoLogin(err)) {
                    let query = new URLSearchParams();
                    query.append('cb', '/images')
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
    }, [actioning, img, navigate, onClose, tag]);

    return (
        <>
            <Dialog
                open={open}
                onClose={handleDialogForceClose}
                aria-labelledby="alert-dialog-title-tag"
                aria-describedby="alert-dialog-description-tag"
                disableRestoreFocus
                fullWidth
            >
                <DialogTitle id="alert-dialog-title-tag">
                    Add a tag
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-tag">
                        Add a tag to the image <b>{img.idShort}</b>
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Repo:Tag"
                        id="imgname"
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
                        error={submitTimes > 0 && tag === ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} disabled={actioning}>
                        Cancel
                    </Button>
                    <Button onClick={handleDialogConfirm} disabled={actioning}>
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleAlertClose}>
                <Alert severity="error" onClose={handleAlertClose}>{actionErr}</Alert>
            </Snackbar>
        </>
    );
}