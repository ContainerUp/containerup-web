import ContainerShellSettings from "./ContainerShellSettings";
import {useState} from "react";
import {useParams} from "react-router-dom";
import TwoWayPipe from "../../../lib/TwoWayPipe";
import ContainerShellTerminal from "./ContainerShellTerminal";

export default function ContainerShell() {
    const {containerId} = useParams();
    const [execOpts, setExecOpts] = useState({
        interactive: true,
        tty: true,
        cmd: '/bin/bash'
    });

    const [start, setStart] = useState(false);

    const pipe = new TwoWayPipe();

    const handleExec = opts => {
        setExecOpts(opts);
        setStart(true);
    }

    return (
        <>
            <ContainerShellSettings
                execOpts={execOpts}
                onExec={handleExec}
                stopPipeSide={pipe.useLeft()}
            />
            <ContainerShellTerminal
                containerId={containerId}
                execOpts={execOpts}
                stopPipeSide={pipe.useRight()}
                start={start}
            />
        </>
    );
}