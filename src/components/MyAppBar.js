import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import {styled} from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";

// from https://mui.com/material-ui/react-drawer/#mini-variant-drawer
const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export default function MyAppBar({drawerOpen, onOpen, children}) {
    return (
        <AppBar position="fixed" open={drawerOpen}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={onOpen}
                    edge="start"
                    sx={{
                        marginRight: 5,
                        ...(drawerOpen && { display: 'none' }),
                    }}
                >
                    <MenuIcon />
                </IconButton>
                {children}
            </Toolbar>
        </AppBar>
    );
}