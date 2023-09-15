import {Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {green, orange} from "@mui/material/colors";
import {Link as RouterLink} from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import {useState} from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ImageActionRemove from "./ImageActionRemove";
import ImageActionTag from "./ImageActionTag";

export default function ImageActions({img, onDeleted, onTagged}) {
    const [dialogDel, setDialogDel] = useState(false);
    const [dialogTag, setDialogTag] = useState(false);

    const handleDialogDelClose = (ok, delAct) => {
        setDialogDel(false);
        if (ok) {
            onDeleted(delAct);
        }
    };

    const handleDialogTagClose = tag => {
        setDialogTag(false);
        if (tag) {
            onTagged(tag);
        }
    };

    const handleClickAction = action => {
        switch (action) {
            case 'tag': {
                return () => {
                    setDialogTag(true);
                };
            }

            case 'remove': {
                return () => {
                    setDialogDel(true);
                };
            }

            default:
                return null;
        }
    };

    const createContainerParam = new URLSearchParams();
    createContainerParam.set('image', img.nameOrId);

    return (
        <>
            <ImageActionRemove open={dialogDel} img={img} onClose={handleDialogDelClose} />
            <ImageActionTag open={dialogTag} img={img} onClose={handleDialogTagClose} />

            <Tooltip title="Create a container using this image">
                <IconButton
                    aria-label="create a container using this image"
                    color="primary"
                    component={RouterLink}
                    to={'/containers_create?' + createContainerParam.toString()}
                >
                    <AddCircleIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Add a tag">
                <IconButton
                    aria-label="add a tag"
                    sx={{color: green[500]}}
                    onClick={handleClickAction('tag')}
                >
                    <LocalOfferIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Remove">
                <IconButton
                    aria-label="remove"
                    sx={{color: orange[300]}}
                    onClick={handleClickAction('remove')}
                >
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </>
    );
}