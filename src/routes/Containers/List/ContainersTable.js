import {
    Alert, Box,
    Paper, Stack,
    Table,
    TableBody,
    TableCell as MuiTableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import MyTableRowsLoader from "../../../components/MyTableRowsLoader";
import MyTableRowSingle from "../../../components/MyTableRowSingle";

import Link from '@mui/material/Link';
import {Link as RouterLink} from "react-router-dom";
import ContainerStatus from "../ContainerStatus";
import {useMemo} from "react";
import ContainerActions from "./ContainerActions";
import CreatedAt from "../../../components/CreatedAt";
import {styled} from "@mui/material/styles";

export const TableCell = styled(MuiTableCell)(({theme}) => ({
    [theme.breakpoints.down('xl')]: {
        padding: 12
    },
    [theme.breakpoints.down('lg')]: {
        padding: 6
    },
    [theme.breakpoints.down('md')]: {
        padding: 3
    }
}));

export default function ContainersTable({loading, errMsg, containersData}) {
    const cd = useMemo(() => {
        return containersData.map(c => {
            c.idShort = c.Id.substring(0, 12);

            c.ports = []
            if (c.Ports) {
                c.Ports.forEach(p => {
                    let ip = '0.0.0.0';
                    if (p.host_ip) {
                        ip = p.host_ip
                    }
                    c.ports.push({
                        ip,
                        host_port: p.host_port,
                        container_port: p.container_port,
                        protocol: p.protocol
                    });
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
                                <Link component={RouterLink} to={c.idShort + '/overview'}>
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
                                        <Box key={i} sx={{display: 'flex', flexWrap: 'wrap'}}>
                                            <div>{p.ip}:{p.host_port}</div>
                                            <div>->{p.container_port}/{p.protocol}</div>
                                        </Box>
                                    ))}
                                </Stack>
                            </TableCell>

                            <TableCell>
                                <CreatedAt created3339Nano={c.Created} />
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
                                <ContainerActions c={c} />
                            </TableCell>
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
        </TableContainer>
    );
}