import {useEffect, useMemo, useState} from "react";
import {Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {useNavigate} from "react-router-dom";
import {getController} from "../../../lib/HostGuestController";
import ImagesTable from "./ImagesTable";
import dataModel from "../../../lib/dataModel";
import ImagePull from "./ImagePull";
import {aioProvider} from "../../../lib/dataProvidor";

export default function ImageList() {
    const [loading, setLoading] = useState(true)
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [pullDialogOpen, setPullDialogOpen] = useState(false);

    useEffect(() => {
        const onData = data => {
            setImages(data);
            setLoading(false);
        };

        const onError = error => {
            if (dataModel.errIsNoLogin(error)) {
                let query = new URLSearchParams();
                query.append('cb', '/images')
                navigate('/login?' + query.toString());
                return;
            }
            let e = error.toString();
            if (error.response) {
                e = error.response.data;
            }
            setErrMsg(e);
            setLoading(false);
        };

        const cancel = aioProvider().imagesList(onData, onError);
        return () => cancel();
    }, [navigate]);

    const handleClickPull = () => {
        setPullDialogOpen(true);
    }

    const handlePullDialogClose = shouldRefresh => {
        if (shouldRefresh) {
            setLoading(true);
        }
        setPullDialogOpen(false)
    }

    const barButtons = useMemo(() => (
        <>
            <Tooltip title="Pull an image">
                <IconButton
                    aria-label="pull an container"
                    color="inherit"
                    onClick={handleClickPull}
                >
                    <CloudDownloadIcon />
                </IconButton>
            </Tooltip>
        </>
    ), []);

    useEffect(() => {
        const ctrl = getController('bar_button');
        const unregister = ctrl.asControllerGuest(barButtons);
        return () => unregister();
    }, [barButtons]);

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

            <ImagePull dialogOpen={pullDialogOpen} onClose={handlePullDialogClose} />
        </>
    );
}