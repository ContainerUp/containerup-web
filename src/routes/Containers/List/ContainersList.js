import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import dataModel from "../../../lib/dataModel";
import ContainersTable from "./ContainersTable";
import AddIcon from '@mui/icons-material/Add';
import {Box, Button} from "@mui/material";

export default function ContainersList() {
    const [loading, setLoading] = useState(false)
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [containers, setContainers] = useState([]);

    const refreshTable = useCallback((clear, ac) => {
        setLoading(true);
        setErrMsg('');
        if (clear) {
            setContainers([]);
        }

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
        const ac = new AbortController()
        refreshTable(false, ac);
        return () => ac.abort();
    }, [refreshTable]);

    return (
        <>
            <Box sx={{marginBottom: "16px"}}>
                <Button variant="outlined" startIcon={<AddIcon />} size="small">
                    Create
                </Button>
            </Box>

            <ContainersTable
                loading={loading}
                errMsg={errMsg}
                containersData={containers}
            />
        </>
    );
}