import {useCallback, useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import dataModel from "../../../lib/dataModel";
import ContainersTable from "./ContainersTable";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {Tooltip} from "@mui/material";
import {getController} from "../../../lib/HostGuestController";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from '@mui/icons-material/Refresh';
import {Link as RouterLink} from 'react-router-dom';

export default function ContainersList() {
    const [loading, setLoading] = useState(true)
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [containers, setContainers] = useState([]);

    const refreshTable = useCallback(ac => {
        // setLoading(true);
        setErrMsg('');

        dataModel.containerList(ac)
            .then(resp => {
                setContainers(resp);
            })
            .catch(error => {
                if (ac.signal.aborted) {
                    return;
                }
                if (dataModel.errIsNoLogin(error)) {
                    let query = new URLSearchParams();
                    query.append('cb', '/containers')
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
    }, [navigate]);

    useEffect(() => {
        if (!loading) {
            return;
        }

        const ac = new AbortController()
        refreshTable(ac);
        return () => ac.abort();
    }, [loading, refreshTable]);


    const handleRefresh = () => {
        setLoading(true);
    };

    const handleUpdated = () => {
        setLoading(true);
    };

    const barButtons = useMemo(() => (
        <>
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
        const unregister = ctrl.asControllerGuest([{text: 'Containers'}]);
        return () => unregister();
    }, []);

    useEffect(() => {
        document.title = 'ContainerUp - Containers';
    }, []);

    return (
        <ContainersTable
            loading={loading}
            errMsg={errMsg}
            containersData={containers}
            onUpdated={handleUpdated}
        />
    );
}