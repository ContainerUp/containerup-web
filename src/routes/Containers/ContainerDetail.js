import {Box, Tab, Tabs} from "@mui/material";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {useEffect, useMemo, useState} from "react";

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
    label: "Exec / Shell"
}, {
    to: "statistics",
    label: "Statistics"
}, {
    to: "settings",
    label: "Settings"
}];

const tabsMap = {};
tabs.forEach((t, i) => {
    tabsMap[t.to] = i;
})

export default function ContainerDetail() {
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
    }, [pathname])

    const [value, setValue] = useState(tabVal);
    const navigate = useNavigate();

    useEffect(() => {
        if (!tabValValid) {
            navigate('overview');
        }
    }, [tabValValid, navigate])

    if (!tabValValid) {
        // navigate
        return (
            <></>
        );
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Box sx={{ width: '100%', marginBottom: '16px' }}>
                <Tabs value={value} onChange={handleChange} aria-label="container tabs">
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

            <Outlet />
        </>
    );
}