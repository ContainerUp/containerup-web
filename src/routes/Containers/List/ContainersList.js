import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import dataModel from "../../../lib/dataModel";
import ContainersTable from "./ContainersTable";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {Tooltip} from "@mui/material";
import {getController} from "../../../lib/HostGuestController";
import IconButton from "@mui/material/IconButton";
import {Link as RouterLink} from 'react-router-dom';
import {aioProvider, isConnectError, isDisconnectError} from "../../../lib/dataProvidor";
import {showWebsocketDisconnectError} from "../../../components/notifications/WebsocketDisconnectError";
import ContainerUpLearnMore from "../../../components/ContainerUpLearnMore";
import {closeSnackbar, enqueueSnackbar} from "notistack";
import WebsocketConnectError from "../../../components/notifications/WebsocketConnectError";

export default function ContainersList() {
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [containers, setContainers] = useState([]);

    useEffect(() => {
        const snackbarKeys = [];
        let count = 0;

        let tryConnect = () => {};
        let cancel = () => {};
        let retryTimeout = null;
        let tryCount = 0;
        let disconnectKey = null;

        const onData = data => {
            setContainers(data);
            setLoading(false);

            if (disconnectKey) {
                closeSnackbar(disconnectKey);
                disconnectKey = null;
                tryCount = 0;
            }
            count ++;
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
                snackbarKeys.push(enqueueSnackbar(e, {
                    variant: "error",
                    persist: true
                }));
                setLoading(false);
            } else {
                if (isDisconnectError(error) || count) {
                    // if count > 0, it must be a disconnect err
                    if (!disconnectKey) {
                        // do not show multiple disconnect error
                        disconnectKey = showWebsocketDisconnectError();
                    }
                    retryTimeout = setTimeout(() => {
                        tryConnect();
                        retryTimeout = null;
                    }, 1000 * tryCount * tryCount);
                } else {
                    if (disconnectKey) {
                        retryTimeout = setTimeout(() => {
                            tryConnect();
                            retryTimeout = null;
                        }, 1000 * tryCount * tryCount);
                    } else {
                        // show connect error only when connecting
                        // no retry
                        if (isConnectError(error)) {
                            snackbarKeys.push(WebsocketConnectError());
                        } else {
                            snackbarKeys.push(enqueueSnackbar(e, {
                                variant: "error",
                                persist: true
                            }));
                        }
                    }
                }
            }
        };

        tryConnect = () => {
            count = 0;
            cancel = aioProvider().containersList(onData, onError);
            tryCount ++;
        };

        tryConnect();
        return () => {
            cancel();
            for (const key of snackbarKeys) {
                // todo fix snackbar
                console.log('close snackbar');
                closeSnackbar(key);
            }
            if (disconnectKey) {
                closeSnackbar(disconnectKey);
                disconnectKey = null;
            }
            if (retryTimeout) {
                clearTimeout(retryTimeout);
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