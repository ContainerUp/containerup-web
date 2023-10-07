import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import dataModel from "../../../lib/dataModel";
import ContainersTable from "./ContainersTable";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {Tooltip} from "@mui/material";
import {getController} from "../../../lib/HostGuestController";
import IconButton from "@mui/material/IconButton";
import {Link as RouterLink} from 'react-router-dom';
import {aioProvider, isDisconnectError} from "../../../lib/dataProvidor";
import {showWebsocketDisconnectError} from "../../../components/WebsocketDisconnectError";
import ContainerUpLearnMore from "../../../components/ContainerUpLearnMore";
import {closeSnackbar} from "notistack";

export default function ContainersList() {
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [containers, setContainers] = useState([]);

    useEffect(() => {
        const snackbarKeys = [];

        const onData = data => {
            setContainers(data);
            setLoading(false);
        };

        const onError = error => {
            if (dataModel.errIsNoLogin(error)) {
                let query = new URLSearchParams();
                query.append('cb', '/containers');
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
                    snackbarKeys.push(showWebsocketDisconnectError());
                } else {
                    setErrMsg(e);
                }
            }
        };

        const cancel = aioProvider().containersList(onData, onError);
        return () => {
            cancel();
            for (const key of snackbarKeys) {
                closeSnackbar(key);
            }
        };
    }, [loading, navigate]);

    const barButtons = useMemo(() => (
        <Tooltip title="Create a container">
            <IconButton
                aria-label="create a container"
                color="inherit"
                to="/containers_create"
                component={RouterLink}
            >
                <AddCircleOutlineIcon />
            </IconButton>
        </Tooltip>
    ), []);

    useEffect(() => {
        const ctrl = getController('bar_button');
        const unregister = ctrl.asControllerGuest(barButtons);
        return () => unregister();
    }, [barButtons]);

    useEffect(() => {
        const ctrl = getController('bar_breadcrumb');
        const unregister = ctrl.asControllerGuest([{text: 'Containers'}]);
        return () => unregister();
    }, []);

    useEffect(() => {
        document.title = 'ContainerUp - Containers';
    }, []);

    return (
        <>
            <ContainersTable
                loading={loading}
                errMsg={errMsg}
                containersData={containers}
            />

            <ContainerUpLearnMore variant="long" />
        </>

    );
}