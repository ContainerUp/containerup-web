import TextField from "@mui/material/TextField";
import {
    Alert,
    Box,
    Button,
    CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle,
    Stack
} from "@mui/material";
import {Autocomplete} from '@mui/material';
import {useEffect, useRef, useState} from "react";
import dataModel from "../../../lib/dataModel";
import {useNavigate, useSearchParams} from "react-router-dom";
import {grey} from "@mui/material/colors";
import ImagePullTerminal from "../../Images/List/ImagePullTerminal";
import CreateImagePullActions from "./CreateImagePullActions";
import Pipe from "../../../lib/Pipe";
import CheckIcon from "@mui/icons-material/Check";

const checkNameAndGetImage = (containerName, imageId, abortController) => {
    const p1 = dataModel.containerInspect(containerName, false, abortController)
        .then(d => {
            throw new Error("There is already a container with the same name.");
        })
        .catch(err => {
            if (err.response && err.response.status === 404) {
                return true;
            }
            throw err;
        });

    const p2 = dataModel.imageInspect(imageId, false, abortController)
        .catch(error => {
            let errStr = error.toString();
            if (error.response) {
                errStr = error.response.data;
            }
            throw new Error('Cannot get image: ' + errStr);
        })

    return Promise.all([p1, p2])
        .then(([v1, v2]) => {
            return v2;
        });
};

const expandImages = images => {
    const ret = [];

    for (const img of images) {
        let hasTag = false;
        if (Array.isArray(img.Names)) {
            for (const repoTag of img.Names) {
                const parts = repoTag.split(':');
                let [repo, tag] = ['', ''];
                if (parts.length === 2) {
                    [repo, tag] = parts;
                } else {
                    [repo] = parts;
                    tag = '<none>';
                }
                ret.push({
                    ...img,
                    repo,
                    tag,
                    nameOrId: repoTag,
                    idShort: img.Id.substring(0, 12)
                });
                hasTag = true;
            }
        }

        if (!hasTag) {
            const idShort = img.Id.substring(0, 12);
            ret.push({
                ...img,
                repo: '<none>',
                tag: '<none>',
                nameOrId: idShort,
                idShort: idShort
            })
        }
    }
    return ret;
}

export default function CreateNameImage({name, image, onConfirm, onEdited}) {
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();
    const [imgOptions, setImgOptions] = useState([]);
    const [loadingImgOpts, setLoadingImgOpts] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const [containerName, setContainerName] = useState(name);
    const [imageName, setImageName] = useState(image);
    const [imageOpt, setImageOpt] = useState(null);

    const [pulling, setPulling] = useState(false);
    const pulledImageId = useRef('');

    const [pullDialogOpen, setPullDialogOpen] = useState(false);

    const pullTerminationPipe = new Pipe();
    const pullTerminationOnReceive = pullTerminationPipe.useOnReceive();
    const pullTerminationWriter = pullTerminationPipe.useWriter();

    const imgPulled = imageName && imageOpt && (
        (imageOpt.Names && imageOpt.Names[0] && imageName === imageOpt.Names[0]) ||
        (imageOpt.Id && imageName === imageOpt.Id.substring(0, 12))
    );

    const [loadingImageDetail, setLoadingImageDetail] = useState(false);

    const handleSubmit = event => {
        event.preventDefault();

        setErrMsg('');
        if (!imgPulled) {
            pulledImageId.current = '';
            setPullDialogOpen(true);
            return;
        }

        // next step
        setLoadingImageDetail(true);
    }

    const checkIfEdited = () => {
        const changed = imageName !== image || containerName !== name;
        onEdited(changed);
    };

    const handleNameChange = event => {
        setContainerName(event.target.value);
        checkIfEdited();
    };

    const handleImageNameChange = (event, value) => {
        setImageName(value);
        checkIfEdited();
    };

    const handlePullDialogClose = () => {
        setPulling(false);
        setPullDialogOpen(false);
        if (pulledImageId.current) {
            setLoadingImgOpts(true);
        }
    };

    const handlePullDialogForceClose = () => {
        if (pulling && pulledImageId.current === '') {
            return;
        }
        handlePullDialogClose();
    };

    const handlePullDialogConfirm = () => {
        setPulling(true);
    };

    const handlePullFinish = (success, pulledImgId) => {
        if (success) {
            pulledImageId.current = pulledImgId;
        }
        pullTerminationWriter();
    };

    useEffect(() => {
        if (!loadingImgOpts) {
            return;
        }

        const ac = new AbortController();
        dataModel.imageList(ac)
            .then(data => {
                const expandedImages = expandImages(data);
                setImgOptions(expandedImages);
                // setImageOpt to match searchParam
                const urlImage = searchParams.get('image');
                if (urlImage && !imageOpt) {
                    let match = null;
                    for (const img of expandedImages) {
                        if (img.idShort === urlImage ||
                            (img.nameOrId === urlImage)) {
                            match = img;
                            break;
                        }
                    }
                    if (match) {
                        setImageOpt(match);
                        setImageName(match.nameOrId);
                    }
                    return;
                }

                // after pulling
                if (imageName) {
                    // if imageName does not match imageOpt, update them
                    if (!imageOpt ||
                        imageOpt.nameOrId !== imageName ||
                        imageOpt.idShort !== imageName
                    ) {

                        if (pulledImageId.current) {
                            let match = null;
                            for (const img of expandedImages) {
                                if (img.Id === pulledImageId.current) {
                                    match = img;
                                    break;
                                }
                            }
                            if (match) {
                                setImageOpt(match);
                                setImageName(match.nameOrId);
                                // next step now
                                setLoadingImageDetail(true);
                            }
                        }

                    }
                }
            })
            .catch(error => {
                if (ac.signal.aborted) {
                    return;
                }
                if (dataModel.errIsNoLogin(error)) {
                    let query = new URLSearchParams();
                    query.append('cb', '/containers_create')
                    navigate('/login?' + query.toString());
                    return;
                }
                let errStr = error.toString();
                if (error.response) {
                    errStr = error.response.data;
                }
                setErrMsg('Cannot get image list: ' + errStr);
            })
            .finally(() => {
                if (ac.signal.aborted) {
                    return;
                }
                setLoadingImgOpts(false);
            })

        return () => ac.abort();
    }, [imageName, loadingImgOpts, containerName, navigate, onConfirm, imageOpt, searchParams]);

    useEffect(() => {
        if (!loadingImageDetail) {
            return;
        }

        const ac = new AbortController();
        checkNameAndGetImage(containerName, imageOpt.Id, ac)
            .then(imgData => {
                onConfirm({
                    name: containerName,
                    imageDetail: imgData
                });
                onEdited(false);
            })
            .catch(error => {
                if (ac.signal.aborted) {
                    return;
                }

                if (dataModel.errIsNoLogin(error)) {
                    let query = new URLSearchParams();
                    query.append('cb', '/containers_create')
                    navigate('/login?' + query.toString());
                    return;
                }
                let errStr = error.toString();
                if (error.response) {
                    errStr = error.response.data;
                }
                setErrMsg(errStr);
            })
            .finally(() => {
                if (ac.signal.aborted) {
                    return;
                }
                setLoadingImageDetail(false);
            })

        return () => ac.abort();
    }, [containerName, imageName, imageOpt, loadingImageDetail, navigate, onConfirm, onEdited]);

    return (
        <Stack spacing={2} sx={{ width: 500 }} component="form" onSubmit={handleSubmit}>
            <TextField
                label="Name"
                size="small"
                required
                sx={{width: 200}}
                value={containerName}
                onChange={handleNameChange}
            />

            <Autocomplete
                size="small"
                inputValue={imageName}
                onInputChange={handleImageNameChange}
                onChange={(event, newVal) => {
                    setImageOpt(newVal);
                }}
                freeSolo
                isOptionEqualToValue={(option, value) => option.Id === value.Id}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') {
                        return option;
                    }
                    return option.nameOrId;
                }}
                renderOption={(props, option) => {
                    let name = option.nameOrId;
                    if (name === option.idShort) {
                        name = '<none>:<none>';
                    }
                    return (
                        <Box component="li" {...props}>
                            <Box sx={{ flexGrow: 1 }}>
                                {name}
                            </Box>
                            <Box sx={{color: grey[500]}}>
                                {option.idShort}
                            </Box>
                        </Box>
                    );
                }}
                options={imgOptions}
                loading={loadingImgOpts}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Image"
                        required
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loadingImgOpts ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                disabled={!!image}
            />

            {!!errMsg && (
                <Alert severity="error">
                    {errMsg}
                </Alert>
            )}

            <Box>
                <Button
                    variant="outlined"
                    type="submit"
                    disabled={loadingImgOpts || loadingImageDetail}
                    startIcon={<CheckIcon />}
                >
                    Confirm
                </Button>
            </Box>

            <Dialog
                open={pullDialogOpen}
                onClose={handlePullDialogForceClose}
                aria-labelledby="alert-dialog-title-pull-image"
                aria-describedby="alert-dialog-description-pull-image"
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="alert-dialog-title-pull-image">
                    Pull an image
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-pull-image">
                        {!pulling && (
                            <>
                                The image <b>{imageName}</b> is not found locally. <br />
                                To continue, pull this image first. Pull the image now?
                            </>
                        )}
                    </DialogContentText>
                    {pulling && (
                        <Box
                            sx={{height: '400px'}}
                        >
                            <ImagePullTerminal image={imageName} onFinish={handlePullFinish} />
                        </Box>
                    )}
                </DialogContent>
                <CreateImagePullActions
                    pulling={pulling}
                    onConfirm={handlePullDialogConfirm}
                    onClose={handlePullDialogClose}
                    pullTerminationOnReceive={pullTerminationOnReceive}
                />
            </Dialog>

        </Stack>
    );
}