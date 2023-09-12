import {useEffect, useMemo, useState} from "react";
import {Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import RefreshIcon from "@mui/icons-material/Refresh";
import {useNavigate} from "react-router-dom";
import {getController} from "../../../lib/HostGuestController";
import ImagesTable from "./ImagesTable";
import dataModel from "../../../lib/dataModel";
import ImagePull from "./ImagePull";

export default function ImageList() {
    const [loading, setLoading] = useState(true)
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [pullDialogOpen, setPullDialogOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            return;
        }

        setErrMsg('');
        const ac = new AbortController()
        dataModel.imageList(ac)
            .then(resp => {
                setImages(resp);
            })
            .catch(error => {
                if (ac.signal.aborted) {
                    return;
                }
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
                setErrMsg(e)
            })
            .finally(() => {
                if (ac.signal.aborted) {
                    return;
                }
                setLoading(false);
            });

        return () => ac.abort();
    }, [loading, navigate]);

    const handleRefresh = () => {
        setLoading(true);
    };

    const handleUpdated = () => {
        setLoading(true);
    };

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

            <Tooltip title="Refresh">
                <IconButton
                    aria-label="refresh"
                    color="inherit"
                    onClick={handleRefresh}
                >
                    <RefreshIcon />
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
                onUpdated={handleUpdated}
            />

            <ImagePull dialogOpen={pullDialogOpen} onClose={handlePullDialogClose} />
        </>
    );
}