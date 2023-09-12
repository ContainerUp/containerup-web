import {Autocomplete, Box, Button, Chip, Stack} from "@mui/material";
import TextField from "@mui/material/TextField";
import {useEffect, useMemo, useRef, useState} from "react";
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from "@mui/material/IconButton";
import RestoreIcon from '@mui/icons-material/Restore';
import {green} from "@mui/material/colors";

const Cmd = ({cmd, imageDetail, editing, onChange, onEditing, disabled}) => {
    const inputRef = useRef();

    const handleSubmit = (event) => {
        event.preventDefault();

        onEditing(false);
        onChange(inputRef.current.value);
    };

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    return (
        <Stack direction="row" spacing={1} component="form" onSubmit={handleSubmit}>
            {(editing || cmd) ? (
                <TextField
                    label="Command"
                    size="small"
                    defaultValue={cmd}
                    sx={{ width: 400 }}
                    disabled={!editing}
                    inputRef={inputRef}
                    helperText={editing ? 'Clear to return to default' : ''}
                />
            ) : (
                <Autocomplete
                    multiple
                    options={imageDetail.Config.Cmd || []}
                    defaultValue={imageDetail.Config.Cmd || []}
                    readOnly
                    freeSolo
                    renderInput={(params) => (
                        <TextField {...params} label="Command" size="small" sx={{ width: 400 }} />
                    )}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip size="small" label={option} {...getTagProps({ index })} />
                        ))
                    }
                    disabled
                />
            )}

            <Box>
                <Stack direction="row">
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
                                onClick={event => {
                                    event.preventDefault();
                                    onEditing(false);
                                }}
                                variant="outlined"
                                aria-label="cancel"
                                color="warning"
                            >
                                <ClearIcon />
                            </IconButton>
                        </>
                    ) : (
                        <IconButton
                            onClick={event => {
                                event.preventDefault();
                                onEditing(true);
                            }}
                            color="primary"
                            aria-label="edit"
                            disabled={disabled}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                </Stack>
            </Box>


        </Stack>
    );
};

const WorkDir = ({workdir, imageDetail, editing, onChange, onEditing, disabled}) => {
    const inputRef = useRef();
    const defaultWorkDir = imageDetail.Config.WorkingDir;

    const defaultVal = workdir || defaultWorkDir || '/';
    const [val, setVal] = useState(defaultVal);

    const handleSubmit = (event) => {
        event.preventDefault();

        onEditing(false);

        let cbVal = val;
        if (!defaultWorkDir && val === '/') {
            cbVal = '';
        } else if (defaultWorkDir && val === defaultWorkDir) {
            cbVal = '';
        }

        // show default value instead of empty
        if (!cbVal && cbVal !== defaultWorkDir) {
            setVal(defaultWorkDir || '/')
        }
        onChange(cbVal);
    };

    const handleCancel = event => {
        event.preventDefault();
        setVal(defaultVal);
        onEditing(false);
    };

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    return (
        <Stack direction="row" spacing={1} component="form" onSubmit={handleSubmit}>
            <TextField
                label="Working directory"
                size="small"
                value={val}
                sx={{ width: 400 }}
                disabled={!editing}
                onChange={event => setVal(event.target.value)}
                inputRef={inputRef}
                helperText={editing ? 'Clear to return to default' : ''}
            />

            <Box>
                <Stack direction="row">
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
                        <IconButton
                            onClick={event => {
                                event.preventDefault();
                                onEditing(true);
                            }}
                            color="primary"
                            aria-label="edit"
                            disabled={disabled}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                </Stack>
            </Box>

        </Stack>
    )
}

export default function CreateEntrypointCmd({cmd, workDir, imageDetail, onEdited, onConfirm}) {
    const [editCmd, setEditCmd] = useState(cmd);
    const [editWorkDir, setEditWorkDir] = useState(workDir);

    const [editing, setEditing] = useState([false, false]);
    const [version, setVersion] = useState(0);

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

    const handleConfirm = () => {
        onConfirm({
            cmd: editCmd,
            workDir: editWorkDir
        });
    };

    const handleRevert = () => {
        setEditing([false, false]);
        setEditWorkDir(workDir);
        setEditCmd(cmd);
        setVersion(v => v + 1);
    };

    const changed = useMemo(() => {
        return cmd !== editCmd || workDir !== editWorkDir;
    }, [cmd, editCmd, editWorkDir, workDir]);

    useEffect(() => {
        onEdited(changed || anyEditing);
    }, [anyEditing, changed, onEdited]);

    const handleCmdChange = v => {
        setEditCmd(v);
    };

    const handleWorkDirChange = v => {
        setEditWorkDir(v);
    };

    return (
        <Stack spacing={2} key={version}>
            {/*entrypoint, do not edit it, even though possible*/}
            <Autocomplete
                multiple
                options={imageDetail.Config.Entrypoint || []}
                defaultValue={imageDetail.Config.Entrypoint || []}
                readOnly
                freeSolo
                renderInput={(params) => (
                    <TextField {...params} label="Entrypoint" size="small" sx={{ width: 400 }} />
                )}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip size="small" label={option} {...getTagProps({ index })} />
                    ))
                }
                disabled
            />

            <Cmd
                cmd={editCmd}
                imageDetail={imageDetail}
                editing={editing[0]}
                onChange={handleCmdChange}
                onEditing={v => handleEditing(0, v)}
                disabled={anyEditing && !editing[0]}
            />

            <WorkDir
                workdir={editWorkDir}
                imageDetail={imageDetail}
                editing={editing[1]}
                onChange={handleWorkDirChange}
                onEditing={v => handleEditing(1, v)}
                disabled={anyEditing && !editing[1]}
            />

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