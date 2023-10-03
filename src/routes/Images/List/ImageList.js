import {useCallback, useEffect, useState} from "react";
import {Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {useNavigate} from "react-router-dom";
import {getController} from "../../../lib/HostGuestController";
import ImagesTable from "./ImagesTable";
import dataModel from "../../../lib/dataModel";
import ImagePullDialog from "./ImagePullDialog";
import {aioProvider, isDisconnectError} from "../../../lib/dataProvidor";
import {showWebsocketDisconnectError} from "../../../components/WebsocketDisconnectError";
import ContainerUpLearnMore from "../../../components/ContainerUpLearnMore";

export default function ImageList() {
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [images, setImages] = useState([]);


    useEffect(() => {
        const onData = data => {
            setImages(data);
            setLoading(false);
        };

        const onError = error => {
            if (dataModel.errIsNoLogin(error)) {
                let query = new URLSearchParams();
                query.append('cb', '/images');
                navigate('/login?' + query.toString());
                return;
            }
            let e = error.toString();
            if (error.response) {
                e = error.response.data;
            }
            if (loading) {
                setErrMsg(e);
                setLoading(false);
            } else {
                if (isDisconnectError(error)) {
                    showWebsocketDisconnectError();
                } else {
                    setErrMsg(e);
                }
            }
        };

        const cancel = aioProvider().imagesList(onData, onError);
        return () => cancel();
    }, [loading, navigate]);

    useEffect(() => {
        const ctrl = getController('bar_button');
        const unregister = ctrl.asControllerGuest(<ImageListBarButtons />);
        return () => unregister();
    }, []);

    useEffect(() => {
        const ctrl = getController('bar_breadcrumb');
        const unregister = ctrl.asControllerGuest([{text: 'Images'}]);
        return () => unregister();
    }, []);

    useEffect(() => {
        document.title = 'ContainerUp - Images';
    }, []);

    return (
        <>
            <ImagesTable
                loading={loading}
                errMsg={errMsg}
                imagesData={images}
            />

            <ContainerUpLearnMore variant="long" />
        </>
    );
}

export function ImageListBarButtons() {
    const [pullDialogOpen, setPullDialogOpen] = useState(false);

    const handleCloseDialog = useCallback(() => {
        setPullDialogOpen(false);
    }, []);

    return (
        <>
            <Tooltip title="Pull an image">
                <IconButton
                    aria-label="pull an container"
                    color="inherit"
                    onClick={() => setPullDialogOpen(true)}
                >
                    <CloudDownloadIcon />
                </IconButton>
            </Tooltip>

            <ImagePullDialog open={pullDialogOpen} onClose={handleCloseDialog} />
        </>
    );
}
