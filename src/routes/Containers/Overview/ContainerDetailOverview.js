import {useNavigate, useParams} from "react-router-dom";
import MyDataTable from "../../../components/MyDataTable";
import {useCallback, useEffect, useState} from "react";
import dataModel from "../../../lib/dataModel";
import {Alert, Box, Chip, Skeleton, Stack} from "@mui/material";
import ContainerStatus from "../ContainerStatus";

import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import IconButton from "@mui/material/IconButton";
import timeUtil from "../../../lib/timeUtil";
import sizeUtil from "../../../lib/sizeUtil";
import CreatedAt from "../../../components/CreatedAt";

const dataKeys = [
    {
        label: "Short ID",
        dataFunc: resp => resp.Id.substring(0, 12)
    },
    {
        label: "Long ID",
        dataFunc: resp => resp.Id
    },
    {
        label: "Container name",
        dataFunc: resp => resp.Name
    },
    {
        label: "Image name",
        dataFunc: resp => resp.ImageName
    },
    {
        label: "Image ID",
        dataFunc: resp => resp.Image
    },
    {
        label: "Created At",
        dataFunc: resp => {
            return (
                <>
                    {resp.Created && (
                        <CreatedAt created3339Nano={resp.Created} />
                    )}
                </>
            );
        }
    },
    {
        label: "Status",
        dataFunc: resp => {
            return (
                <>
                    {resp.State && (
                        <ContainerStatus
                            state={resp.State.Status}
                            exitCode={resp.State.ExitCode}
                            exitAt={timeUtil.parseRFC3339Nano(resp.State.FinishedAt)}
                            startedAt={timeUtil.parseRFC3339Nano(resp.State.StartedAt)}
                        />
                    )}
                </>
            );
        }
    },
    {
        label: 'Working directory',
        dataFunc: resp => resp.Config?.WorkingDir
    },
    {
        label: "Entrypoint",
        dataFunc: resp => resp.Config?.Entrypoint
    },
    {
        label: "Command",
        dataFunc: resp => {
            if (!resp.Config || !resp.Config.Cmd) {
                return '';
            }
            return (
                <Stack direction="row" spacing={0.5}>
                    {resp.Config.Cmd.map((v, i) => (
                        <Chip label={v} key={i} size="small" />
                    ))}
                </Stack>
            );
        }
    },{
        label: "Ports",
        dataFunc: resp => {
            const ports = [];
            if (resp.HostConfig && resp.HostConfig.PortBindings) {
                const pb = resp.HostConfig.PortBindings;
                Object.keys(pb).forEach(key => {
                    pb[key]?.forEach(h => {
                        let ip = '0.0.0.0';
                        if (h.HostIp) {
                            ip = h.HostIp;
                        }
                        ports.push(`${ip}:${h.HostPort}->${key}`);
                    })
                });
            }
            return (
                <Stack>
                    {ports.map((p, i) => (
                        <Box key={i}>
                            {p}
                        </Box>
                    ))}
                </Stack>
            );
        }
    },{
        label: "Size",
        dataFunc: resp => {
            if (!resp.SizeRootFs && !resp.SizeRw) {
                return (
                    <>
                        <span>
                            Not calculated
                        </span>

                        {/*<Tooltip title="Calculate">*/}
                        {/*    <IconButton aria-label="caculate" color="primary" size="small">*/}
                        {/*        <TroubleshootIcon />*/}
                        {/*    </IconButton>*/}
                        {/*</Tooltip>*/}
                    </>
                );
            }
            return (
                <>
                    {sizeUtil.humanReadableSize(resp.SizeRw)}
                    {' '}
                    (virtual {sizeUtil.humanReadableSize(resp.SizeRootFs)})
                </>
            );
        },
        valueSx: {padding: '12px 16px'}
    }
];

const loading = (<Skeleton animation="wave" variant="text" sx={{maxWidth: "480px"}}/>);

const populateTableData = resp => {
    const d = [];
    dataKeys.forEach(row => {
        let v = loading;
        if (row.dataFunc) {
            v = row.dataFunc(resp);
        }
        d.push({label: row.label, value: v, valueSx: row.valueSx});
    });
    return d;
};

export default function ContainerDetailOverview() {
    const {containerId} = useParams();
    const [errMsg, setErrMsg] = useState('');
    const navigate = useNavigate();

    const [tableData, setTableData] = useState(populateTableData({Id: containerId}));

    const loadDataTable = useCallback(( ac) => {
        setErrMsg('');

        dataModel.containerInspect(containerId, true, ac)
            .then(resp => {
                setTableData(populateTableData(resp));
            })
            .catch(error => {
                if (ac.signal.aborted) {
                    return;
                }
                if (dataModel.errIsNoLogin(error)) {
                    let query = new URLSearchParams();
                    query.append('cb', '/containers/' + containerId + '/overview')
                    navigate('/login?' + query.toString());
                    return;
                }
                let e = error.toString();
                if (error.response) {
                    e = error.response.data;
                }
                setErrMsg(e)
            });
    }, [navigate, containerId]);

    useEffect(() => {
        const ac = new AbortController()
        loadDataTable(ac);
        return () => ac.abort();
    }, [loadDataTable]);

    return (
        <>
            {!errMsg && (
                <MyDataTable data={tableData} />
            )}

            {!!errMsg && (
                <Alert severity="error">
                    {errMsg}
                </Alert>
            )}
        </>
    );
}