import {
    Alert, Box,
    Paper, Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import MyTableRowsLoader from "../../../components/MyTableRowsLoader";
import MyTableRowSingle from "../../../components/MyTableRowSingle";

import Link from '@mui/material/Link';
import {Link as RouterLink} from "react-router-dom";
import ContainerStatus from "../ContainerStatus";
import timeUtil from "../../../lib/timeUtil";
import {useMemo} from "react";
import ContainerActions from "./ContainerActions";

export default function ContainersTable({loading, errMsg, containersData, onUpdated}) {
    const cd = useMemo(() => {
        return containersData.map(c => {
            c.createdDate = timeUtil.parseRFC3339Nano(c.Created);
            c.createdAgo = timeUtil.dateAgo(c.createdDate);

            c.idShort = c.Id.substring(0, 12);

            c.ports = []
            if (c.Ports) {
                c.Ports.forEach(p => {
                    let ip = '0.0.0.0';
                    if (p.host_ip) {
                        ip = p.host_ip
                    }
                    c.ports.push(`${ip}:${p.host_port}=>${p.container_port}/${p.protocol}`);
                });
            }

            c.canStart = c.State === 'exited' || c.State === 'created';
            c.canStop = c.State === 'running';
            c.canExec = c.State === 'running';
            c.canDelete = c.State === 'exited' || c.State === 'created';

            return c;
        });
    }, [containersData]);

    return (
        <TableContainer component={Paper}>
            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="containers table">
                <TableHead>
                    <TableRow>
                        <TableCell>Container ID</TableCell>
                        <TableCell>Names</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Ports</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading && (
                        <MyTableRowsLoader rows={3} cols={7} sx={{height: '72px'}} />
                    )}

                    {!!errMsg && (
                        <MyTableRowSingle cols={7}>
                            <Alert severity="error">
                                {errMsg}
                            </Alert>
                        </MyTableRowSingle>
                    )}

                    {!errMsg && !loading && !containersData.length && (
                        <MyTableRowSingle cols={7}>
                            No container found. Create one?
                        </MyTableRowSingle>
                    )}

                    {!errMsg && !loading && cd.map(c => (
                        <TableRow key={c.Id}>
                            <TableCell>
                                <Link component={RouterLink} to={c.idShort}>
                                    {c.idShort}
                                </Link>
                            </TableCell>

                            <TableCell>
                                {c.Names[0]}
                            </TableCell>

                            <TableCell>
                                {c.Image}
                            </TableCell>

                            <TableCell>
                                <Stack>
                                    {c.ports.map((p, i) => (
                                        <Box key={i}>
                                            {p}
                                        </Box>
                                    ))}
                                </Stack>
                            </TableCell>

                            <TableCell>
                                <Tooltip title={c.createdDate.toLocaleString()}>
                                    <span>
                                        {c.createdAgo}
                                    </span>
                                </Tooltip>
                            </TableCell>

                            <TableCell>
                                <ContainerStatus
                                    state={c.State}
                                    exitCode={c.ExitCode}
                                    exitAt={c.ExitedAt}
                                    startedAt={c.StartedAt}
                                />
                            </TableCell>

                            <TableCell>
                                <ContainerActions c={c} onUpdated={onUpdated} />
                            </TableCell>
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
        </TableContainer>
    );
}