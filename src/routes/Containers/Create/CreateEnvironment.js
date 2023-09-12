import {Box, Button, Stack} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import {green} from "@mui/material/colors";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {useEffect, useMemo, useRef, useState} from "react";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';

const envRe = /^([a-zA-Z0-9_]+)=(.*)$/;
const envNameRe = /^[a-zA-Z0-9_]+$/;

const parseEnvStr = envStr => {
    const m = envStr.match(envRe);
    if (!m) {
        return [false, false];
    }
    return [m[1], m[2]];
};

const Env = ({env, editing, onChange, onEditing, onDelete, disabled}) => {
    const inputRefName = useRef();
    const inputRefValue = useRef();
    const [editEnv, setEditEnv] = useState(env);
    const [submitTries, setSubmitTries] = useState(0);
    const [dupVal, setDupVal] = useState(undefined);

    // Do not show error before first submit, for better experience
    const suppressError = submitTries === 0;
    const invalidName = !editEnv.name.match(envNameRe);

    const handleSubmit = event => {
        event.preventDefault();

        setSubmitTries(t => t + 1);

        if (invalidName) {
            inputRefName.current?.focus();
            return;
        }

        const ok = onChange(editEnv);
        if (!ok) {
            setDupVal(editEnv.name);
            return;
        }

        setDupVal(undefined);
        setSubmitTries(0);
        onEditing(false);
    };

    const handleCancel = event => {
        event.preventDefault();

        if (!env.name && !env.value) {
            onDelete();
            return;
        }

        setEditEnv(env);
        onEditing(false);
    };

    const handleReset = event => {
        event.preventDefault();

        const newEnv = {
            ...editEnv,
            value: editEnv.default
        };
        setEditEnv(newEnv);
        onChange(newEnv);
    }

    useEffect(() => {
        if (editing) {
            if (env.predefined) {
                inputRefValue.current?.focus();
                return;
            }

            if (!env.name) {
                inputRefName.current?.focus();
                return;
            }
            inputRefValue.current?.focus();
        }
    }, [editing, env]);

    let helperTextName = env.predefined && editing ? 'Predefined by image' : '';
    if (!helperTextName) {
        if (editEnv.name === dupVal) {
            helperTextName = 'Duplicated variable';
        }
    }

    let helperTextValue = '';
    if (env.predefined && editEnv.value !== editEnv.default) {
        helperTextValue = 'Customized';
    }

    return (
        <Stack direction="row" spacing={1} component="form" onSubmit={handleSubmit}>
            <TextField
                label="Name"
                size="small"
                value={editEnv.name}
                sx={{ width: '250px' }}
                disabled={!editing || env.predefined}
                onChange={event => setEditEnv({
                    ...editEnv,
                    name: event.target.value
                })}
                inputRef={inputRefName}
                error={(!suppressError && invalidName) || (editEnv.name === dupVal)}
                helperText={helperTextName}
            />

            <TextField
                label="Value"
                size="small"
                value={editEnv.value}
                sx={{ width: '250px' }}
                disabled={!editing}
                onChange={event => setEditEnv({
                    ...editEnv,
                    value: event.target.value
                })}
                inputRef={inputRefValue}
                helperText={helperTextValue}
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
                        {!env.predefined && (
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
                        {env.predefined && env.value !== env.default && (
                            <IconButton
                                onClick={handleReset}
                                color="warning"
                                aria-label="reset"
                                disabled={disabled}
                                type="button"
                            >
                                <RestoreIcon />
                            </IconButton>
                        )}
                    </>
                )}
            </Box>

        </Stack>
    );
}

export default function CreateEnvironment({envs, imageDetail, onEdited, onConfirm}) {
    const [editEnvs, setEditEnvs] = useState(envs);
    const editingGenerator = () => {
        const map = {};
        let total = envs.length;

        // predefined volumes + customized volumes. deduplicated
        // length === combinedEnvs.length
        envs.forEach((v, i) => {
            map[v.name] = i;
        });
        if (imageDetail.Config.Env) {
            imageDetail.Config.Env.forEach(envStr => {
                const [name, value] = parseEnvStr(envStr);
                if (map[name] === undefined) {
                    total += 1;
                }
            })
        }
        return [...Array(total)].map(() => false);
    };
    const [editing, setEditing] = useState(editingGenerator);
    const [version, setVersion] = useState(0);

    const combinedEnvs = useMemo(() => {
        const ret = [];
        const map = {};
        // predefined envs first
        if (imageDetail.Config.Env) {
            imageDetail.Config.Env.forEach((envStr, i) => {
                const [name, value] = parseEnvStr(envStr);
                if (!name) {
                    return;
                }
                ret.push({
                    name: name,
                    value: value,
                    predefined: true,
                    default: value
                });
                map[name] = i;
            });
        }
        // then customized envs
        for (const env of editEnvs) {
            const mapIdx = map[env.name];
            if (mapIdx !== undefined) {
                ret[mapIdx] = env;
                continue;
            }
            ret.push(env);
        }
        return ret;
    }, [editEnvs, imageDetail]);

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
        combinedEnvs.forEach((env, idx) => {
            combinedMap[env.name] = idx;
        });

        const myIdx = combinedMap[newVal.name];
        if (myIdx !== i && myIdx !== undefined) {
            // The key points to another row? Duplication!
            return false;
        }

        // replace the dirty item, or copy clean items
        const newEnvs = [];
        combinedEnvs.forEach((env, idx) => {
            if (idx === i) {
                if (!newVal.predefined || (newVal.predefined && newVal.value !== newVal.default)) {
                    // remove predefined but ignored volume
                    newEnvs.push(newVal);
                }
            } else {
                if ((env.predefined && env.value !== env.default) || (!env.predefined && env.name)) {
                    newEnvs.push(env);
                }
            }
        });

        setEditEnvs(newEnvs);
        return true;
    };

    const handleDelete = i => {
        // We edit editVolumes, instead of combinedVolumes. So we need the correct index.
        let envIndex = i;
        for (const env of combinedEnvs) {
            if (!env.predefined) {
                break;
            }
            if (env.value === env.default) {
                envIndex -= 1;
            }
        }

        setEditEnvs(editEnvs.filter((v, idx) => {
            return idx !== envIndex;
        }));
        setEditing(editing.filter((v, idx) => {
            return idx !== i;
        }));
    }

    const handleConfirm = () => {
        onConfirm(editEnvs);
        onEdited(false);
    };

    const handleRevert = () => {
        setEditing(editingGenerator);
        setEditEnvs(envs);
        setVersion(v => v + 1);
    };

    const changed = useMemo(() => {
        let c = envs.length !== editEnvs.length;
        if (!c) {
            for (let i = 0; i < envs.length; i ++) {
                const [a, b] = [envs[i], editEnvs[i]];

                for (const key of Object.keys(a)) {
                    if (a[key] !== b[key]) {
                        c = true;
                        break;
                    }
                }
            }
        }
        return c;
    }, [editEnvs, envs]);

    useEffect(() => {
        onEdited(changed || anyEditing);
    }, [anyEditing, changed, onEdited]);

    const handleAdd = () => {
        setEditEnvs([...editEnvs, {
            name: '',
            value: ''
        }]);
        setEditing([...editing, true]);
    }

    return (
        <Stack spacing={2} key={version}>
            {combinedEnvs.map((env, i) => (
                <Env
                    key={i + '/' + env.name}
                    env={env}
                    editing={editing[i]}
                    onChange={v => handleChange(i, v)}
                    onEditing={v => handleEditing(i, v)}
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