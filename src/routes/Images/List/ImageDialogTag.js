import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {useEffect, useState} from "react";
import dataModel from "../../../lib/dataModel";
import {useNavigate} from "react-router-dom";
import {enqueueSnackbar} from "notistack";

export default function ImageDialogTag({open, image, onClose}) {
    const navigate = useNavigate();
    const [tag, setTag] = useState('');
    const [submitTimes, setSubmitTimes] = useState(0);
    const [actioning, setActioning] = useState(false);

    const handleDialogClose = () => {
        onClose();
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

    useEffect(() => {
        if (!actioning) {
            return;
        }

        const ac = new AbortController();
        dataModel.imageAction(image.idShort, {
            action: 'tag',
            repoTag: tag
        }, ac)
            .then(() => {
                onClose();
                const msg = (<span>
                    Tag <b>{tag}</b> added to <b>{image.idShort}</b>.
                </span>);
                enqueueSnackbar(msg, {variant: 'success'});
                setTag('');
            })
            .catch(err => {
                if (ac.signal.aborted) {
                    return;
                }
                if (dataModel.errIsNoLogin(err)) {
                    let query = new URLSearchParams();
                    query.append('cb', '/images');
                    navigate('/login?' + query.toString());
                    return;
                }
                let errStr = err.toString();
                if (err.response) {
                    errStr = err.response.data;
                }
                enqueueSnackbar(errStr, {variant: 'error'});
            })
            .finally(() => {
                if (ac.signal.aborted) {
                    return;
                }
                setActioning(false);
            });

        return () => ac.abort();
    }, [actioning, image, navigate, onClose, tag]);

    return (
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
                    Add a tag to the image <b>{image.idShort}</b>
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
    );
}