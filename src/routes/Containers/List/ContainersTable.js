import {
    Alert,
    Paper,
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
import {green, red, orange, blue, grey} from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import SubjectIcon from '@mui/icons-material/Subject';
import TerminalIcon from '@mui/icons-material/Terminal';

import Link from '@mui/material/Link';
import { Link as RouterLink } from "react-router-dom";
import ContainerStatus from "../ContainerStatus";
import timeUtil from "../../../lib/timeUtil";

export default function ContainersTable({loading, errMsg, containersData}) {

    containersData.map(c => {
        c.CreatedDate = timeUtil.parseRFC3339Nano(c.Created);
        c.CreatedAgo = timeUtil.dateAgo(c.CreatedDate);
        return c;
    });

    return (
        <TableContainer component={Paper}>
            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Container ID</TableCell>
                        <TableCell>Names</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading && (
                        <MyTableRowsLoader rows={3} cols={5} />
                    )}

                    {!!errMsg && (
                        <MyTableRowSingle cols={5}>
                            <Alert severity="error">
                                {errMsg}
                            </Alert>
                        </MyTableRowSingle>
                    )}

                    {!errMsg && !loading && !containersData.length && (
                        <MyTableRowSingle cols={5}>
                            No container found. Create one?
                        </MyTableRowSingle>
                    )}

                    {containersData.map(c => (
                        <TableRow key={c.Id}>
                            <TableCell>
                                <Link component={RouterLink} to={c.Id.substring(0, 12)}>
                                    {c.Id.substring(0, 12)}
                                </Link>
                            </TableCell>

                            <TableCell>
                                {c.Names[0]}
                            </TableCell>

                            <TableCell>
                                {c.Image}
                            </TableCell>

                            <TableCell>
                                <Tooltip title={c.CreatedDate.toLocaleString()}>
                                    <span>
                                        {c.CreatedAgo}
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
                                <Tooltip title="Start">
                                    <span>
                                        <IconButton
                                            aria-label="start"
                                            sx={{color: green[500]}}
                                            disabled={c.State !== 'exited' && c.State !== 'created'}
                                        >
                                                <PlayArrowIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Stop">
                                    <span>
                                        <IconButton
                                            aria-label="stop"
                                            sx={{color: red[900]}}
                                            disabled={c.State === 'exited' || c.State === 'created'}
                                        >
                                            <StopIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Logs">
                                    <span>
                                        <IconButton
                                            aria-label="logs"
                                            sx={{color: blue[300]}}
                                        >
                                            <SubjectIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Exec">
                                    <span>
                                        <IconButton
                                            aria-label="exec"
                                            sx={{color: grey[800]}}
                                            disabled={c.State === 'exited' || c.State === 'created'}
                                        >
                                            <TerminalIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                                <Tooltip title="Delete">
                                    <span>
                                        <IconButton
                                            aria-label="delete"
                                            sx={{color: orange[300]}}
                                            disabled={c.State !== 'exited' && c.State !== 'created'}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>

                            </TableCell>
                        </TableRow>
                    ))}

                </TableBody>
            </Table>
        </TableContainer>
    );
}