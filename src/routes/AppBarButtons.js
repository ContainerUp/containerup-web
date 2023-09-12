import {Box} from "@mui/material";
import {getController} from "../lib/HostGuestController";
import {useEffect, useState} from "react";

const emptyElement = <></>;

export default function AppBarButtons() {
    const [children, setChildren] = useState(emptyElement);

    useEffect(() => {
        const ctrl = getController('bar_button');
        const hostSide = ctrl.asControllerHost();
        const hostSideOnReceive = hostSide.useOnReceive();

        hostSideOnReceive(c => {
            if (!c) {
                c = emptyElement;
            }
            setChildren(c);
        });

        return () => hostSideOnReceive(null);
    }, []);

    return (
        <Box component="div">
            {children}
        </Box>
    );
}