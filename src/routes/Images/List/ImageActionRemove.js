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
import dataModel from "../../../lib/dataModel";
import {useNavigate} from "react-router-dom";

export default function ImageActionRemove({open, img, onClose}) {
    const navigate = useNavigate();
    const [actioning, setActioning] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [actionErr, setActionErr] = useState('');

    const handleDialogClose = () => {
        onClose(false, '');
    }

    const handleDialogForceClose = () => {
        if (actioning) {
            return;
        }
        handleDialogClose();
    };

    const handleDialogConfirm = () => {
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
        const args = {
            action: 'remove'
        };
        if (img.nameOrId !== img.idShort) {
            args.repoTag = img.nameOrId;
        }
        dataModel.imageAction(img.idShort, args, ac)
            .then(d => {
                onClose(true, d);
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
    }, [actioning, img, navigate, onClose]);

    let dialogImageName = img.nameOrId;
    if (dialogImageName !== img.idShort) {
        dialogImageName = (
            <>
                <b>{dialogImageName}</b> ({img.idShort})
            </>
        )
    } else {
        dialogImageName = (
            <b>{img.idShort}</b>
        )
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={handleDialogForceClose}
                aria-labelledby="alert-dialog-title-del"
                aria-describedby="alert-dialog-description-del"
            >
                <DialogTitle id="alert-dialog-title-del">
                    Delete image
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-del">
                        Do you really want to remove {dialogImageName}? <br />
                        The image will be untagged, and will be deleted if there aren't any tags.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} autoFocus disabled={actioning}>
                        Cancel
                    </Button>
                    <Button onClick={handleDialogConfirm} disabled={actioning} color="warning">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleAlertClose}>
                <Alert severity="error" onClose={handleAlertClose}>{actionErr}</Alert>
            </Snackbar>
        </>

    );
}