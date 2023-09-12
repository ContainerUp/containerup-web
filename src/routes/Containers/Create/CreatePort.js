import TextField from "@mui/material/TextField";
import {Box, Button, MenuItem, Select, Stack} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {green} from "@mui/material/colors";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import {useEffect, useMemo, useRef, useState} from "react";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";

const checkContainerPort = str => {
    const p = parseInt(str);
    if (isNaN(p) || p < 1 || p > 65535) {
        return false;
    }
    return p;
};

const checkHostPort = (editPort, editHost) => {
    if (editPort.predefined && editHost === '') {
        return [];
    }

    const portsStr = editHost.split(',');
    const ports = [];
    const portsMap = {};

    for (const str of portsStr) {
        const p = parseInt(str);
        if (isNaN(p) || p < 1 || p > 65535) {
            return false;
        }
        if (portsMap[p]) {
            // duplication check
            return false;
        }
        portsMap[p] = 1;

        ports.push(p);
    }
    ports.sort((a, b) => {
        return a - b;
    });
    if (ports.length === 0) {
        return false;
    }

    return ports;
};

const Port = ({port, editing, onChange, onEditing, onDelete, disabled}) => {
    const inputRefContainer = useRef();
    const inputRefHost = useRef();
    const [editPort, setEditPort] = useState(port);
    const [editHost, setEditHost] = useState(port.host.join(','));
    const [submitTries, setSubmitTries] = useState(0);
    const [dupValContainer, setDupValContainer] = useState(undefined);
    const [dupValHost, setDupValHost] = useState(0);

    // Do not show error before first submit, for better experience
    const suppressError = submitTries === 0;
    const containerPort = checkContainerPort(editPort.container);
    const invalidContainer = !containerPort;
    const hostPorts = checkHostPort(editPort, editHost);
    const invalidHost = !hostPorts;

    const handleSubmit = event => {
        event.preventDefault();

        setSubmitTries(t => t + 1);

        if (invalidContainer || invalidHost) {
            if (invalidContainer) {
                inputRefContainer.current?.focus();
            } else if (invalidHost) {
                inputRefHost.current?.focus();
            }
            return;
        }

        const [okContainer, dupHostVal] = onChange({
            ...editPort,
            container: containerPort,
            host: hostPorts
        });
        if (!okContainer) {
            setDupValContainer(editPort.container);
            return;
        }
        if (dupHostVal) {
            setDupValHost(dupHostVal);
            return;
        }

        setEditHost(hostPorts.join(','));
        setDupValContainer(undefined);
        setDupValHost(0);
        setSubmitTries(0);
        onEditing(false);
    };

    const handleCancel = event => {
        event.preventDefault();

        if (!port.container && !port.host.length) {
            onDelete();
            return;
        }

        setEditPort(port);
        setEditHost(port.host.join(','));
        setDupValContainer(undefined);
        setDupValHost(0);
        setSubmitTries(0);
        onEditing(false);
    };

    useEffect(() => {
        if (editing) {
            if (port.predefined) {
                inputRefHost.current?.focus();
                return;
            }

            if (!port.container) {
                inputRefContainer.current?.focus();
            }
        }
    }, [editing, port]);

    let helperTextContainer = port.predefined && editing ? 'Predefined by image' : '';
    if (!helperTextContainer) {
        if (editPort.container === dupValContainer) {
            helperTextContainer = 'Duplicated port';
        }
    }

    let helperTextHost = '';
    if (!helperTextHost) {
        if (hostPorts && hostPorts.indexOf(dupValHost) !== - 1) {
            helperTextHost = 'Duplicated port ' + dupValHost
        }
    }
    if (!helperTextHost) {
        helperTextHost = port.predefined && editing ? 'Leave empty to ignore' : '';
    }

    return (
        <Stack direction="row" spacing={1} component="form" onSubmit={handleSubmit}>
            <TextField
                label="Container port"
                size="small"
                value={editPort.container === 0 ? '' : editPort.container}
                sx={{ width: 150 }}
                disabled={!editing || port.predefined}
                onChange={event => setEditPort({
                    ...editPort,
                    container: event.target.value
                })}
                error={(!suppressError && invalidContainer) || (editPort.container === dupValContainer)}
                inputRef={inputRefContainer}
                helperText={helperTextContainer}
                inputProps={{pattern: "[0-9]{1,5}"}}
            />

            <Box>
                <Select
                    size="small"
                    sx={{width: '100px'}}
                    value={editPort.protocol}
                    disabled={!editing || editPort.predefined}
                    onChange={event => setEditPort({
                        ...editPort,
                        protocol: event.target.value
                    })}
                >
                    <MenuItem value="tcp">TCP</MenuItem>
                    <MenuItem value="udp">UDP</MenuItem>
                </Select>
            </Box>

            <TextField
                label="Host port"
                size="small"
                value={editHost}
                sx={{ width: '200px' }}
                disabled={!editing}
                onChange={event => setEditHost(event.target.value)}
                error={!suppressError && (invalidHost || dupValHost > 0)}
                inputRef={inputRefHost}
                helperText={helperTextHost}
                inputProps={{pattern: "[0-9]{1,5}(,[0-9]{1,5})*"}}
            />

            <Box>
                {editing ? (
                    <>
                        <IconButton
                            type="submit"
                            aria-label="confirm"
                            sx={{color: green[500]}}
                        >
                            <CheckIcon />
                        </IconButton>
                        <IconButton
                            onClick={handleCancel}
                            variant="outlined"
                            aria-label="cancel"
                            color="warning"
                        >
                            <ClearIcon />
                        </IconButton>
                    </>
                ) : (
                    <>
                        <IconButton
                            onClick={event => {
                                event.preventDefault();
                                onEditing(true);
                            }}
                            color="primary"
                            aria-label="edit"
                            disabled={disabled}
                            type="button"
                        >
                            <EditIcon />
                        </IconButton>
                        {!port.predefined && (
                            <IconButton
                                onClick={event => {
                                    event.preventDefault();
                                    onDelete();
                                }}
                                color="warning"
                                aria-label="remove"
                                disabled={disabled}
                                type="button"
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}

                    </>
                )}
            </Box>

        </Stack>
    );
};

export default function CreatePort({ports, imageDetail, onEdited, onConfirm}) {
    const [editPorts, setEditPorts] = useState(ports);
    const editingGenerator = () => {
        const map = {};
        let total = ports.length;

        // predefined volumes + customized volumes. deduplicated
        // length === combinedVolumes.length
        ports.forEach((v, i) => {
            map[v.container + '/' + v.protocol] = i;
        });
        if (imageDetail.Config.ExposedPorts) {
            Object.keys(imageDetail.Config.ExposedPorts).forEach(containerPortProto => {
                if (map[containerPortProto] === undefined) {
                    total += 1;
                }
            })
        }
        return [...Array(total)].map(() => false);
    };
    const [editing, setEditing] = useState(editingGenerator);
    const [version, setVersion] = useState(0);

    const combinedPorts = useMemo(() => {
        const ret = [];
        const map = {};
        // predefined ports first
        if (imageDetail.Config.ExposedPorts) {
            Object.keys(imageDetail.Config.ExposedPorts).forEach((containerPortProto, i) => {
                const [containerPort, protocol] = containerPortProto.split('/');
                ret.push({
                    container: parseInt(containerPort),
                    host: [],
                    protocol: protocol,
                    predefined: true
                });
                map[containerPortProto] = i;
            });
        }
        // then customized volumes
        for (const v of editPorts) {
            const mapIdx = map[v.container + '/' + v.protocol];
            if (mapIdx !== undefined) {
                ret[mapIdx] = v;
                continue;
            }
            ret.push(v);
        }
        return ret;
    }, [editPorts, imageDetail]);

    const anyEditing = useMemo(() => {
        return editing.indexOf(true) !== -1;
    }, [editing]);

    const handleEditing = (i, newVal) => {
        if (editing[i] === newVal) {
            return;
        }
        setEditing(editing.map((oldVal, idx) => {
            if (idx === i) {
                return newVal;
            }
            return oldVal;
        }));
    };

    const handleChange = (i, newVal) => {
        // To find the correct index, build a map first
        const combinedMap = {};
        const hostPortMap = {};
        combinedPorts.forEach((port, idx) => {
            combinedMap[port.container + '/' + port.protocol] = idx;

            if (idx !== i) {
                for (const p of port.host) {
                    hostPortMap[p + '/' + port.protocol] = 1;
                }
            }
        });

        const myIdx = combinedMap[newVal.container + '/' + newVal.protocol];
        if (myIdx !== i && myIdx !== undefined) {
            // The key points to another row? Duplication!
            return [false, 0];
        }

        // duplicated host ports
        for (const p of newVal.host) {
            const exist = hostPortMap[p + '/' + newVal.protocol];
            if (exist) {
                return [true, p];
            }
            // hostPortMap[p + '/' + newVal.protocol] = 1;
        }

        // replace the dirty item, or copy clean items
        const newPorts = [];
        combinedPorts.forEach((port, idx) => {
            if (idx === i) {
                if (!newVal.predefined || newVal.host.length) {
                    // remove predefined but ignored volume
                    newPorts.push(newVal);
                }
            } else {
                if (port.container && port.host.length) {
                    newPorts.push(port);
                }
            }
        });

        setEditPorts(newPorts);
        return [true, 0];
    };

    const handleDelete = i => {
        // We edit editVolumes, instead of combinedVolumes. So we need the correct index.
        let volumeIndex = i;
        for (const port of combinedPorts) {
            if (!port.predefined) {
                break;
            }
            if (!port.host.length) {
                volumeIndex -= 1;
            }
        }

        setEditPorts(editPorts.filter((v, idx) => {
            return idx !== volumeIndex;
        }));
        setEditing(editing.filter((v, idx) => {
            return idx !== i;
        }));
    };


    const handleConfirm = () => {
        onConfirm(editPorts);
        onEdited(false);
    };

    const handleRevert = () => {
        setEditing(editingGenerator);
        setEditPorts(ports);
        setVersion(v => v + 1);
    };

    const changed = useMemo(() => {
        let c = ports.length !== editPorts.length;
        if (!c) {
            for (let i = 0; i < ports.length; i ++) {
                const [a, b] = [ports[i], editPorts[i]];

                for (const key of Object.keys(a)) {
                    if (a[key] !== b[key]) {
                        c = true;
                        break;
                    }
                }
            }
        }
        return c;
    }, [editPorts, ports]);

    useEffect(() => {
        onEdited(changed || anyEditing);
    }, [anyEditing, changed, onEdited]);

    const handleAdd = () => {
        setEditPorts([...editPorts, {
            container: 0,
            host: [],
            protocol: 'tcp'
        }]);
        setEditing([...editing, true]);
    }

    return (
        <Stack spacing={3} key={version}>
            {combinedPorts.map((v, i) => (
                <Port
                    key={i + '/' + v.container + '/' + v.protocol}
                    port={v}
                    editing={editing[i]}
                    onEditing={v => handleEditing(i, v)}
                    onChange={v => handleChange(i, v)}
                    onDelete={() => handleDelete(i)}
                    disabled={anyEditing && !editing[i]}
                />
            ))}

            <Box>
                <IconButton
                    aria-label="add"
                    sx={{color: green[500]}}
                    disabled={anyEditing}
                    onClick={handleAdd}
                >
                    <AddCircleOutlineIcon />
                </IconButton>
            </Box>

            <Stack direction="row" spacing={1}>
                <Button
                    variant="outlined"
                    disabled={anyEditing}
                    startIcon={<CheckIcon />}
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>

                <Button
                    variant="outlined"
                    disabled={!changed || anyEditing}
                    startIcon={<RestoreIcon />}
                    onClick={handleRevert}
                    color="warning"
                >
                    Revert
                </Button>
            </Stack>

        </Stack>
    );
}