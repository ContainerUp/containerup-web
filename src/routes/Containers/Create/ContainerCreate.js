import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Alert,
    Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack,
} from "@mui/material";
import {useEffect, useMemo, useState} from "react";
import {grey, orange} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {getController} from "../../../lib/HostGuestController";
import CreateNameImage from "./CreateNameImage";
import {getImageNameFromInspection} from "../../../lib/imageUtil";
import CreateEntrypointCmd from "./CreateEntrypointCmd";
import CreateEnvironment from "./CreateEnvironment";
import CreateVolume from "./CreateVolume";
import CreatePort from "./CreatePort";
import dataModel from "../../../lib/dataModel";
import {useNavigate} from "react-router-dom";

export default function ContainerCreate() {
    const navigate = useNavigate();
    const [open, setOpen] = useState([true, false, false, false, false]);
    const [disabled, setDisabled] = useState([false, true, true, true, true]);
    const [edited, setEdited] = useState([false, false, false, false, false]);

    const [showDialog, setShowDialog] = useState(false);
    const [dialogIntent, setDialogIntent] = useState(null);

    const [name, setName] = useState('');
    const [imageDetail, setImageDetail] = useState(null);

    const [version, setVersion] = useState([0, 0, 0, 0, 0]);
    const [cmd, setCmd] = useState('');
    const [workDir, setWorkDir] = useState('');
    const [envs, setEnvs] = useState([]);
    const [volumes, setVolumes] = useState([]);
    const [ports, setPorts] = useState([]);

    const [errMsg, setErrMsg] = useState('');
    const [creating, setCreating] = useState(false);

    const setOnlyOneOpen = index => {
        setOpen(open.map((val, i) => {
            return i === index;
        }));
    };

    const anyEdited = useMemo(() => {
        return edited.indexOf(true) !== -1;
    }, [edited]);

    const handleExpandedChange = (index, expanded) => {
        if (index === 0 && !imageDetail) {
            if (expanded) {
                setOnlyOneOpen(index);
                return;
            }
            setOnlyOneOpen(-1);
            return;
        }

        if (!expanded && edited[index]) {
            // close current one
            setDialogIntent({
                index,
                expanded
            });
            setShowDialog(true);
            return;
        }
        if (expanded && anyEdited) {
            // open other one
            setDialogIntent({
                index,
                expanded
            });
            setShowDialog(true);
            return;
        }

        // open only one
        setOpen(open.map((val, i) => {
            if (i === index) {
                return expanded;
            }
            return false;
        }));
    };

    const handleEdited = (i, newVal) => {
        if (edited[i] === newVal) {
            return;
        }
        setEdited(edited.map((oldVal, idx) => {
            if (idx === i) {
                return newVal;
            }
            return oldVal;
        }));
    };

    const handleConfirmNameImage = p => {
        setName(p.name);
        setImageDetail(p.imageDetail);

        setOnlyOneOpen(1);
        setDisabled([false, false, false, false, false]);
    };

    const handleDialogCancel = () => {
        setShowDialog(false);
    };

    const handleDialogDiscard = () => {
        const toReset = edited.indexOf(true);
        setVersion(version.map((v, idx) => {
            if (idx === toReset) {
                return v + 1;
            }
            return v;
        }));
        setEdited([false, false, false, false, false]);

        // open only one
        setOpen(open.map((val, i) => {
            if (i === dialogIntent.index) {
                return dialogIntent.expanded;
            }
            return false;
        }));
        setDialogIntent(null);
        setShowDialog(false);
    };

    // breadcrumb
    useEffect(() => {
        const ctrl = getController('bar_breadcrumb');
        const unregister = ctrl.asControllerGuest([{
            text: 'Containers',
            href: '/containers'
        }, {
            text: 'Create'
        }]);
        return () => unregister();
    }, []);

    const handleCreate = () => {
        setCreating(true);
        setErrMsg('');
    };

    useEffect(() => {
        if (!creating) {
            return;
        }

        const envMap = {};
        for (const e of envs) {
            envMap[e.name] = e.value;
        }

        const ac = new AbortController();
        dataModel.containerCreate({
            name: name,
            image: getImageNameFromInspection(imageDetail),
            command: cmd,
            workDir: workDir,
            env: envMap,
            volumes: volumes.map(v => {
                return {
                    container: v.container,
                    host: v.host,
                    rw: v.rw
                };
            }),
            ports: ports.map(p => {
                return {
                    container: p.container,
                    host: p.host,
                    protocol: p.protocol
                };
            })
        }, ac)
            .then(data => {
                navigate('/containers');
            })
            .catch(error => {
                if (ac.signal.aborted) {
                    return;
                }

                console.log(error)
                let errStr = error.toString();
                if (dataModel.errIsNoLogin(error)) {
                    errStr = 'Session expired. Reload the page, and try again.';
                } else {
                    if (error.response) {
                        errStr = error.response.data;
                    }
                }

                setErrMsg(errStr);
            })
            .finally(() => {
                if (ac.signal.aborted) {
                    return;
                }
                setCreating(false);
            });

        return () => ac.abort();
    }, [cmd, creating, envs, imageDetail, name, navigate, ports, volumes, workDir]);

    useEffect(() => {
        document.title = 'ContainerUp - Create a container';
    }, []);

    return (
        <Box sx={{margin: "0 36px"}}>
            <Accordion
                expanded={open[0]}
                onChange={(event, open) => handleExpandedChange(0, open)}
                disabled={disabled[0]}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography sx={{ flexGrow: 1 }}>
                        Name & Image
                    </Typography>
                    {edited[0] && open[0] && (
                        <Typography sx={{color: orange[500]}}>
                            Not saved yet
                        </Typography>
                    )}
                    {!disabled[0] && !open[0] && imageDetail && (
                        <Typography sx={{color: grey[500]}}>
                            {name}, {getImageNameFromInspection(imageDetail)}
                        </Typography>
                    )}
                </AccordionSummary>
                <AccordionDetails>
                    <CreateNameImage
                        name={name}
                        image={getImageNameFromInspection(imageDetail)}
                        onEdited={v => handleEdited(0, v)}
                        onConfirm={handleConfirmNameImage}
                    />
                </AccordionDetails>
            </Accordion>

            <Accordion
                expanded={open[1]}
                onChange={(event, open) => handleExpandedChange(1, open)}
                disabled={disabled[1]}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography sx={{ flexGrow: 1 }}>
                        Entrypoint, Command, and WorkingDirectory
                    </Typography>
                    {edited[1] && open[1] && (
                        <Typography sx={{color: orange[500]}}>
                            Not saved yet
                        </Typography>
                    )}
                    {!disabled[1] && !open[1] && (!!cmd || !!workDir) && (
                        <Typography sx={{color: grey[500]}}>
                            {!!cmd && (
                                <>
                                    Command: {cmd}
                                </>
                            )}
                            {!!cmd && !!workDir && ' '}
                            {!!workDir && (
                                <>
                                    WorkingDir: {workDir}
                                </>
                            )}
                        </Typography>
                    )}
                </AccordionSummary>
                <AccordionDetails>
                    {/* avoid empty imageDetail */}
                    {imageDetail && (
                        <CreateEntrypointCmd
                            key={version[1]}
                            cmd={cmd}
                            workDir={workDir}
                            imageDetail={imageDetail}
                            onEdited={v => handleEdited(1, v)}
                            onConfirm={p => {
                                setCmd(p.cmd);
                                setWorkDir(p.workDir);
                                setOnlyOneOpen(2);
                            }}
                        />
                    )}
                </AccordionDetails>
            </Accordion>

            <Accordion
                expanded={open[2]}
                onChange={(event, open) => handleExpandedChange(2, open)}
                disabled={disabled[2]}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                >
                    <Typography sx={{ flexGrow: 1 }}>
                        Environment variables
                    </Typography>
                    {edited[2] && open[2] && (
                        <Typography sx={{color: orange[500]}}>
                            Not saved yet
                        </Typography>
                    )}
                    {!disabled[2] && !open[2] && envs.length > 0 && (
                        <Typography sx={{color: grey[500]}}>
                            {envs.length} customized variable{envs.length > 1 && 's'}
                        </Typography>
                    )}
                </AccordionSummary>
                <AccordionDetails>
                    {/* avoid empty imageDetail */}
                    {imageDetail && (
                        <CreateEnvironment
                            key={version[2]}
                            envs={envs}
                            imageDetail={imageDetail}
                            onEdited={v => handleEdited(2, v)}
                            onConfirm={p => {
                                setEnvs(p);
                                setOnlyOneOpen(3);
                            }}
                        />
                    )}
                </AccordionDetails>
            </Accordion>

            <Accordion
                expanded={open[3]}
                onChange={(event, open) => handleExpandedChange(3, open)}
                disabled={disabled[3]}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4a-content"
                    id="panel4a-header"
                >
                    <Typography sx={{ flexGrow: 1 }}>
                        Volumes
                    </Typography>
                    {edited[3] && open[3] && (
                        <Typography sx={{color: orange[500]}}>
                            Not saved yet
                        </Typography>
                    )}
                    {!disabled[3] && !open[3] && volumes.length > 0 && (
                        <Typography sx={{color: grey[500]}}>
                            {volumes.length} volume{volumes.length > 1 && 's'}
                        </Typography>
                    )}
                </AccordionSummary>
                <AccordionDetails>
                    {/* avoid empty imageDetail */}
                    {imageDetail && (
                        <CreateVolume
                            key={version[3]}
                            volumes={volumes}
                            imageDetail={imageDetail}
                            onEdited={v => handleEdited(3, v)}
                            onConfirm={p => {
                                setVolumes(p);
                                setOnlyOneOpen(4);
                            }}
                        />
                    )}
                </AccordionDetails>
            </Accordion>

            <Accordion
                expanded={open[4]}
                onChange={(event, open) => handleExpandedChange(4, open)}
                disabled={disabled[4]}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel5a-content"
                    id="panel5a-header"
                >
                    <Typography sx={{ flexGrow: 1 }}>
                        Ports
                    </Typography>
                    {edited[4] && open[4] && (
                        <Typography sx={{color: orange[500]}}>
                            Not saved yet
                        </Typography>
                    )}
                    {!disabled[4] && !open[4] && ports.length > 0 && (
                        <Typography sx={{color: grey[500]}}>
                            {ports.length} port{ports.length > 1 && 's'}
                        </Typography>
                    )}
                </AccordionSummary>
                <AccordionDetails>
                    {/* avoid empty imageDetail */}
                    {imageDetail && (
                        <CreatePort
                            key={version[4]}
                            ports={ports}
                            imageDetail={imageDetail}
                            onEdited={v => handleEdited(4, v)}
                            onConfirm={p => {
                                setPorts(p);
                                setOnlyOneOpen(-1);
                            }}
                        />
                    )}
                </AccordionDetails>
            </Accordion>


            <Dialog
                open={showDialog}
                onClose={handleDialogCancel}
                aria-labelledby="alert-dialog-title-discard"
                aria-describedby="alert-dialog-description-discard"
                fullWidth
            >
                <DialogTitle id="alert-dialog-title-discard">
                    Discard the changes?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-discard">
                        You have unsaved changes.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogDiscard} color="warning">
                        Discard
                    </Button>
                    <Button autoFocus onClick={handleDialogCancel}>
                        Continue editing
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{mt: '20px'}}>
                <Stack spacing={3}>
                    {!!errMsg && (
                        <Alert severity="error">
                            {errMsg}
                        </Alert>
                    )}

                    <Box>
                        <Button
                            variant="outlined"
                            disabled={creating || !imageDetail || anyEdited}
                            onClick={handleCreate}>
                            Create
                        </Button>
                    </Box>
                </Stack>
            </Box>

        </Box>
    );
}