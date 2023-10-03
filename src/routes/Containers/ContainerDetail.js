import {Box, Tab, Tabs} from "@mui/material";
import {Link, Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";
import {getController} from "../../lib/HostGuestController";
import {aioProvider, isDisconnectError} from "../../lib/dataProvidor";
import dataModel from "../../lib/dataModel";
import {showWebsocketDisconnectError} from "../../components/WebsocketDisconnectError";

const tabs = [{
    to: "overview",
    label: "Overview"
}, {
    to: "inspect",
    label: "Inspect"
}, {
    to: "logs",
    label: "Logs"
}, {
    to: "exec",
    label: "Exec"
}, {
    to: "statistics",
    label: "Statistics"
},
// {
//     to: "settings",
//     label: "Settings"
// }
];

const tabsMap = {};
tabs.forEach((t, i) => {
    tabsMap[t.to] = i;
})

export default function ContainerDetail() {
    const {containerId} = useParams();
    const {pathname} = useLocation();

    // if pathname is like /containers/0abcde3333 then redirect to overview
    const [tabVal, tabValValid] = useMemo(() => {
        const parts = pathname.split('/')
        // "", "containers", "0abcde3333", "overview"
        if (parts.length < 4) {
            return [0, false];
        }

        let ret = tabsMap[parts[3]];
        if (ret !== undefined) {
            return [ret, true];
        }
        return [0, false];
    }, [pathname]);

    const navigate = useNavigate();

    useEffect(() => {
        if (!tabValValid) {
            navigate('overview');
        }
    }, [tabValValid, navigate]);

    useEffect(() => {
        const ctrl = getController('bar_breadcrumb');
        const unregister = ctrl.asControllerGuest([{
            text: 'Containers',
            href: '/containers'
        }, {
            text: containerId
        }]);
        return () => unregister();
    }, [containerId]);

    useEffect(() => {
        document.title = 'ContainerUp - Container ' + containerId;
    }, [containerId]);

    useEffect(() => {
        const ctrl = getController('bar_button');
        const unregister = ctrl.asControllerGuest('container_detail_buttons');
        return () => unregister();
    }, []);

    const [container, setContainer] = useState({Id: containerId});
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        const ctrl = getController('container_detail_buttons');
        const unregister = ctrl.asControllerGuest(container);
        return () => unregister();
    }, [container]);

    useEffect(() => {
        const onData = d => {
            setContainer(d);
            setLoading(false);
        };

        const onError = error => {
            if (dataModel.errIsNoLogin(error)) {
                let query = new URLSearchParams();
                query.append('cb', pathname);
                navigate('/login?' + query.toString());
                return;
            }
            let e = error.toString();
            if (error.response) {
                e = error.response.data;
            }
            if (loading) {
                setErrMsg(e);
                setLoading(false);
            } else {
                if (isDisconnectError(error)) {
                    showWebsocketDisconnectError();
                } else {
                    setErrMsg(e);
                }
            }
        };

        const cancel = aioProvider().container(containerId, onData, onError)
        return () => cancel();
    }, [containerId, loading, navigate, pathname]);

    return (
        <>
            {tabValValid && (
                <>
                    <Box sx={{ width: '100%', marginBottom: '16px' }}>
                        <Tabs value={tabVal} aria-label="container tabs">
                            {tabs.map(t => (
                                <Tab
                                    key={t.to}
                                    component={Link}
                                    label={t.label}
                                    to={t.to}
                                />
                            ))}
                        </Tabs>
                    </Box>

                    <Outlet context={{container, loading, errMsg}} />
                </>
            )}
        </>
    );
}