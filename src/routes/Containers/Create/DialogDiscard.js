import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {uiActions} from "./uiSlice";

export default function DialogDiscard() {
    const dispatch = useDispatch();

    const open = useSelector(state => state.ui.showDialogDiscard);

    const handleDialogCancel = () => {
        dispatch(uiActions.closeDialog());
    };

    const handleDialogDiscard = () => {
        dispatch(uiActions.confirmDiscard());
    }

    return (
        <Dialog
            open={open}
            onClose={handleDialogCancel}
            aria-labelledby="alert-dialog-title-discard"
            aria-describedby="alert-dialog-description-discard"
            fullWidth
        >
            <DialogTitle id="alert-dialog-title-discard">
                Discard the changes?
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description-discard">
                    You have unsaved changes.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogDiscard} color="warning">
                    Discard
                </Button>
                <Button autoFocus onClick={handleDialogCancel}>
                    Continue editing
                </Button>
            </DialogActions>
        </Dialog>
    );
}