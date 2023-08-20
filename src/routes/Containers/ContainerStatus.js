import {Box, Tooltip} from "@mui/material";
import {green, red, yellow} from "@mui/material/colors";
import timeUtil from "../../lib/timeUtil";

export default function ContainerStatus({state, exitCode, exitAt, startedAt}) {
    let exitDate = exitAt;
    if (typeof exitAt === 'number') {
        exitDate = new Date(exitAt * 1000);
    }
    const exitAgo = timeUtil.dateAgo(exitDate);

    let startDate = startedAt;
    if (typeof startedAt === 'number') {
        startDate = new Date(startedAt * 1000);
    }
    const startAgo = timeUtil.dateAgo(startDate);

    switch (state) {
        case 'running': {
            return (
                <Box sx={{color: green[500]}}>
                    <Tooltip title={startDate.toLocaleString()}>
                        <span>
                            Up {startAgo}
                        </span>
                    </Tooltip>
                </Box>
            );
        }
        case 'exited': {
            return (
                <Box sx={{color: red[500]}}>
                    <Tooltip title={exitDate.toLocaleString()}>
                        <span>
                            Exited ({exitCode}) {exitAgo}
                        </span>
                    </Tooltip>
                </Box>
            );
        }
        case 'created': {
            return (
                <Box sx={{color: yellow[900]}}>
                    Created
                </Box>
            );
        }
        default:
            return state;
    }
}