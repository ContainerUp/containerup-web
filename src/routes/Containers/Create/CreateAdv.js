import {
    Accordion,
    AccordionDetails,
    AccordionSummary, Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Stack
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import {grey, orange} from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import RestoreIcon from "@mui/icons-material/Restore";
import {useEffect, useMemo, useRef, useState} from "react";

function CreateAdv({adv, onEdited, onConfirm}) {
    const [editAdv, setEditAdv] = useState(adv);
    const [version, setVersion] = useState(0);
    const editedVal = useRef(false);

    const handleChangeStart = event => {
        setEditAdv({
            ...editAdv,
            start: event.target.checked
        });
    };

    const handleConfirm = () => {
        onConfirm(editAdv);
        onEdited(false);
        editedVal.current = false;
    };

    const handleRevert = () => {
        setEditAdv(adv);
        setVersion(v => v + 1);
    };

    const changed = useMemo(() => {
        let c = false;
        for (const key of Object.keys(adv)) {
            if (adv[key] !== editAdv[key]) {
                c = true;
                break;
            }
        }
        return c;
    }, [editAdv, adv]);

    useEffect(() => {
        const v = changed;
        if (v !== editedVal.current) {
            onEdited(v);
            editedVal.current = v;
        }
    }, [changed, onEdited]);

    return (
        <Stack spacing={3} key={version}>
            <FormGroup>
                <FormControlLabel
                    control={<Checkbox
                        checked={editAdv.start}
                        onChange={handleChangeStart}
                    />}
                    label="Start the container (default: yes)"
                />
            </FormGroup>

            <Stack direction="row" spacing={1}>
                <Button
                    variant="outlined"
                    startIcon={<CheckIcon />}
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>

                <Button
                    variant="outlined"
                    disabled={!changed}
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

export default function AccordionAdv({open, disabled, edited, onExpandChange, version, imageDetail, onEdited, onConfirm, adv}) {
    return (
        <Accordion
            expanded={open}
            onChange={onExpandChange}
            disabled={disabled}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel6a-content"
                id="panel6a-header"
            >
                <Typography sx={{ flexGrow: 1 }}>
                    Advanced settings
                </Typography>
                {edited && open && (
                    <Typography sx={{color: orange[500]}}>
                        Not saved yet
                    </Typography>
                )}
                {/*{!disabled && !open && ports.length > 0 && (*/}
                {/*    <Typography sx={{color: grey[500]}}>*/}
                {/*        {ports.length} port{ports.length > 1 && 's'}*/}
                {/*    </Typography>*/}
                {/*)}*/}
            </AccordionSummary>
            <AccordionDetails>
                {/* avoid empty imageDetail */}
                {imageDetail && (
                    <CreateAdv
                        key={version}
                        adv={adv}
                        onEdited={onEdited}
                        onConfirm={onConfirm}
                    />
                )}
            </AccordionDetails>
        </Accordion>
    );
}