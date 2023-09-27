import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Alert,
    Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack,
} from "@mui/material";
import {useCallback, useEffect, useMemo, useState} from "react";
import {grey, orange} from "@mui/material/colors";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {getController} from "../../../lib/HostGuestController";
import CreateNameImage from "./CreateNameImage";
import {getImageNameFromInspection} from "../../../lib/imageUtil";
import AccordionEntrypointCmd from "./CreateEntrypointCmd";
import AccordionEnvironment from "./CreateEnvironment";
import AccordionVolume from "./CreateVolume";
import AccordionPort from "./CreatePort";
import dataModel from "../../../lib/dataModel";
import {useNavigate} from "react-router-dom";
import {enqueueSnackbar} from "notistack";

const allFalse = [false, false, false, false, false];
const allZero = [0, 0, 0, 0, 0];

export default function ContainerCreate() {
    const navigate = useNavigate();
    const [open, setOpen] = useState([true, false, false, false, false]);
    const [disabled, setDisabled] = useState([false, true, true, true, true]);
    const [edited, setEdited] = useState(allFalse);

    const [showDialogDiscard, setShowDialogDiscard] = useState(false);
    const [dialogIntent, setDialogIntent] = useState(null);

    const [name, setName] = useState('');
    const [imageDetail, setImageDetail] = useState(null);

    const [version, setVersion] = useState(allZero);
    const [cmd, setCmd] = useState(undefined);
    const [workDir, setWorkDir] = useState(undefined);
    const [envs, setEnvs] = useState([]);
    const [volumes, setVolumes] = useState([]);
    const [ports, setPorts] = useState([]);

    const [errMsg, setErrMsg] = useState('');
    const [creating, setCreating] = useState(false);

    const setOnlyOneOpen = useCallback(index => {
        setOpen(open => open.map((val, i) => {
            return i === index;
        }));
    }, []);

    const anyEdited = useMemo(() => {
        return edited.indexOf(true) !== -1;
    }, [edited]);

    const handleExpandedChange = useCallback((index, expanded) => {
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
            setShowDialogDiscard(true);
            return;
        }
        if (expanded && anyEdited) {
            // open other one
            setDialogIntent({
                index,
                expanded
            });
            setShowDialogDiscard(true);
            return;
        }

        // open only one
        setOpen(open => open.map((val, i) => {
            if (i === index) {
                return expanded;
            }
            return false;
        }));
    }, [anyEdited, edited, imageDetail, setOnlyOneOpen]);

    const handleEdited = useCallback((i, newVal) => {
        setEdited(edited => edited.map((oldVal, idx) => {
            if (idx === i) {
                return newVal;
            }
            return oldVal;
        }));
    }, []);

    // NameImage
    const handleOpenChangeNameImage = useCallback((event, open) => {
        handleExpandedChange(0, open);
    }, [handleExpandedChange]);

    const handleEditedNameImage = useCallback(v => {
        handleEdited(0, v);
    }, [handleEdited]);

    const handleConfirmNameImage = useCallback(p => {
        setName(p.name);
        setImageDetail(p.imageDetail);

        setOnlyOneOpen(1);
        setDisabled(allFalse);
    }, [setOnlyOneOpen]);

    // EntrypointCmd
    const handleOpenChangeEntrypointCmd = useCallback((event, open) => {
        handleExpandedChange(1, open);
    }, [handleExpandedChange]);

    const handleEditedEntrypointCmd = useCallback(v => {
        handleEdited(1, v);
    }, [handleEdited]);

    const handleConfirmEntrypointCmd = useCallback(p => {
        setCmd(p.cmd);
        setWorkDir(p.workDir);
        setOnlyOneOpen(2);
    }, [setOnlyOneOpen]);

    // Env
    const handleOpenChangeEnv = useCallback((event, open) => {
        handleExpandedChange(2, open);
    }, [handleExpandedChange]);

    const handleEditedEnv = useCallback(v => {
        handleEdited(2, v);
    }, [handleEdited]);

    const handleConfirmEnv = useCallback(p => {
        setEnvs(p);
        setOnlyOneOpen(3);
    }, [setOnlyOneOpen]);

    // Volume
    const handleOpenChangeVolume = useCallback((event, open) => {
        handleExpandedChange(3, open);
    }, [handleExpandedChange]);

    const handleEditedVolume = useCallback(v => {
        handleEdited(3, v);
    }, [handleEdited]);

    const handleConfirmVolume = useCallback(p => {
        setVolumes(p);
        setOnlyOneOpen(4);
    }, [setOnlyOneOpen]);

    // Port
    const handleOpenChangePort = useCallback((event, open) => {
        handleExpandedChange(4, open);
    }, [handleExpandedChange]);

    const handleEditedPort = useCallback(v => {
        handleEdited(4, v);
    }, [handleEdited]);

    const handleConfirmPort = useCallback(p => {
        setPorts(p);
        setOnlyOneOpen(-1);
    }, [setOnlyOneOpen]);


    const handleDialogCancel = () => {
        setShowDialogDiscard(false);
    };

    const handleDialogDiscard = () => {
        const toReset = edited.indexOf(true);
        setVersion(version.map((v, idx) => {
            if (idx === toReset) {
                return v + 1;
            }
            return v;
        }));
        setEdited(allFalse);

        // open only one
        setOpen(open.map((val, i) => {
            if (i === dialogIntent.index) {
                return dialogIntent.expanded;
            }
            return false;
        }));
        setDialogIntent(null);
        setShowDialogDiscard(false);
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
                    readWrite: v.rw
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
                const msg = (<span>
                    Container <b>{name}</b> ({data.Id.substring(0, 12)}) has been created.
                </span>);
                enqueueSnackbar(msg, {variant: 'success'});
                if (data.StartErr) {
                    enqueueSnackbar(data.StartErr, {variant: 'error'});
                }
            })
            .catch(error => {
                if (ac.signal.aborted) {
                    return;
                }

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
                onChange={handleOpenChangeNameImage}
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
                        onEdited={handleEditedNameImage}
                        onConfirm={handleConfirmNameImage}
                    />
                </AccordionDetails>
            </Accordion>

            <AccordionEntrypointCmd
                open={open[1]}
                disabled={disabled[1]}
                edited={edited[1]}
                onExpandChange={handleOpenChangeEntrypointCmd}
                version={version[1]}
                imageDetail={imageDetail}
                onEdited={handleEditedEntrypointCmd}
                onConfirm={handleConfirmEntrypointCmd}
                cmd={cmd}
                workDir={workDir}
            />

            <AccordionEnvironment
                open={open[2]}
                disabled={disabled[2]}
                edited={edited[2]}
                onExpandChange={handleOpenChangeEnv}
                version={version[2]}
                imageDetail={imageDetail}
                onEdited={handleEditedEnv}
                onConfirm={handleConfirmEnv}
                envs={envs}
            />

            <AccordionVolume
                open={open[3]}
                disabled={disabled[3]}
                edited={edited[3]}
                onExpandChange={handleOpenChangeVolume}
                version={version[3]}
                imageDetail={imageDetail}
                onEdited={handleEditedVolume}
                onConfirm={handleConfirmVolume}
                volumes={volumes}
            />

            <AccordionPort
                open={open[4]}
                disabled={disabled[4]}
                edited={edited[4]}
                onExpandChange={handleOpenChangePort}
                version={version[4]}
                imageDetail={imageDetail}
                onEdited={handleEditedPort}
                onConfirm={handleConfirmPort}
                ports={ports}
            />


            <Dialog
                open={showDialogDiscard}
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