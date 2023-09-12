import MyAppBar from "../components/MyAppBar";
import MyDrawer from "../components/MyDrawer";
import MyDrawerItem from "../components/MyDrawerItem";
import List from "@mui/material/List";
import {useEffect, useState} from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import StorageIcon from '@mui/icons-material/Storage';
import AlbumIcon from '@mui/icons-material/Album';
import Divider from "@mui/material/Divider";
import InfoIcon from '@mui/icons-material/Info';
import {Outlet, useNavigate, useOutlet} from "react-router-dom";
import MyContent from "../components/MyContent";
import {Box} from "@mui/material";
import AppBarButtons from "./AppBarButtons";
import AppBarBreadcrumb from "./AppBarBreadcrumb";

export default function Root() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };
    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    const outlet = useOutlet();
    const navigate = useNavigate();
    useEffect(() => {
        if (!outlet) {
            navigate('/containers');
        }
    }, [navigate, outlet]);

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <MyAppBar drawerOpen={drawerOpen} onOpen={handleDrawerOpen}>
                    <AppBarBreadcrumb />
                    <AppBarButtons />
                </MyAppBar>
                <MyDrawer open={drawerOpen} onClose={handleDrawerClose}>
                    <List>
                        {/*<MyDrawerItem*/}
                        {/*    text="Overview"*/}
                        {/*    drawerOpen={drawerOpen}*/}
                        {/*    icon={<DashboardIcon />}*/}
                        {/*    path='/overview'*/}
                        {/*/>*/}
                        <MyDrawerItem
                            text="Containers"
                            drawerOpen={drawerOpen}
                            icon={<StorageIcon />}
                            path='/containers'
                            or={['/containers_create']}
                        />
                        <MyDrawerItem
                            text="Images"
                            drawerOpen={drawerOpen}
                            icon={<AlbumIcon />}
                            path='/images'
                        />
                        <Divider />
                        <MyDrawerItem
                            text="System Info"
                            drawerOpen={drawerOpen}
                            icon={<InfoIcon />}
                            path='/info'
                        />
                        <MyDrawerItem
                            text={"Logout"}
                            drawerOpen={drawerOpen}
                            icon={<LogoutIcon />}
                            path='/logout'
                        />
                    </List>
                </MyDrawer>

                <MyContent>
                    <Outlet />
                </MyContent>
            </Box>
        </>
    );
}