import {useNavigate, useParams} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import dataModel from "../../lib/dataModel";
import {Alert, Paper, Skeleton} from "@mui/material";

export default function ContainerDetailInspect() {
    const {containerId} = useParams();
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();
    const [inspectData, setInspectData] = useState('');
    const [loading, setLoading] = useState(true);

    const loadInspectData = useCallback(( ac) => {
        setErrMsg('');

        dataModel.containerInspect(containerId, true, ac)
            .then(resp => {
                const str = JSON.stringify(resp, null, 4);
                setInspectData(str);
            })
            .catch(error => {
                if (ac.signal.aborted) {
                    return;
                }
                if (dataModel.errIsNoLogin(error)) {
                    let query = new URLSearchParams();
                    query.append('cb', '/containers/' + containerId + '/inspect')
                    navigate('/login?' + query.toString());
                    return;
                }
                let e = error.toString();
                if (error.response) {
                    e = error.response.data;
                }
                setErrMsg(e)
            })
            .finally(() => setLoading(false));
    }, [navigate, containerId]);

    useEffect(() => {
        const ac = new AbortController()
        loadInspectData(ac);
        return () => ac.abort();
    }, [loadInspectData]);

    return (
        <>
            {!loading && !errMsg && (
                <Paper
                    component="pre"
                    sx={{fontSize: '12px', padding: '4px', margin: 0}}
                >
                    {inspectData}
                </Paper>
            )}

            {loading && (
                <Paper
                    sx={{fontSize: '12px', padding: '4px', margin: 0}}
                >
                    {[...Array(10)].map((row, i) => (
                        <>
                            <Skeleton animation="wave" key={i} sx={{width: '35%'}} />
                            <Skeleton animation="wave" key={i} sx={{width: '45%'}} />
                            <Skeleton animation="wave" key={i} sx={{width: '55%'}} />
                        </>
                    ))}
                </Paper>
            )}

            {!!errMsg && (
                <Alert severity="error">
                    {errMsg}
                </Alert>
            )}
        </>
    );
}