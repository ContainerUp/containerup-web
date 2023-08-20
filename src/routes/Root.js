import MyAppBar from "../components/MyAppBar";
import MyDrawer from "../components/MyDrawer";
import MyDrawerItem from "../components/MyDrawerItem";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import {useState} from 'react';

// import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import AlbumIcon from '@mui/icons-material/Album';
import {Outlet} from "react-router-dom";
import MyContent from "../components/MyContent";
import {Box} from "@mui/material";

export default function Root() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };
    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <MyAppBar drawerOpen={drawerOpen} onOpen={handleDrawerOpen}>
                    <Typography variant="h6" noWrap component="div">
                        Podmanman
                    </Typography>
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
                        />
                        <MyDrawerItem
                            text="Images"
                            drawerOpen={drawerOpen}
                            icon={<AlbumIcon />}
                            path='/images'
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