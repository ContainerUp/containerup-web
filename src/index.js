import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'xterm/css/xterm.css';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {purple} from "@mui/material/colors";

import Root from './routes/Root'
import Login from './routes/Login'
import ContainersList from "./routes/Containers/List/ContainersList";
import ImageList from "./routes/Images/List/ImageList";
import ContainerDetail from "./routes/Containers/ContainerDetail";
import ContainerDetailOverview from "./routes/Containers/Overview/ContainerDetailOverview";
import ContainerDetailInspect from "./routes/Containers/Inspect/ContainerDetailInspect";
import ContainerLogs from "./routes/Containers/Logs/ContainerLogs";
import ContainerDetailStatistics from "./routes/Containers/Stat/ContainerDetailStatistics";
import ContainerExec from "./routes/Containers/Exec/ContainerExec";
import ContainerDetailSettings from "./routes/Containers/ContainerDetailSettings";
import SystemInfo from "./routes/System/SystemInfo";
import ImageDetail from "./routes/Images/Detail/ImageDetail";
import ContainerCreate from "./routes/Containers/Create/ContainerCreate";
import Logout from "./routes/Logout";
import {
    Chart as ChartJS,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const theme = createTheme({
    palette: {
        primary: {
            main: purple[700],
        },
    },
});

const router = createBrowserRouter([{
    path: "/",
    element: <Root />,
    children: [{
        path: '/containers',
        element: <ContainersList />,
    }, {
        path: '/containers_create',
        element: <ContainerCreate />,
    }, {
        path: '/containers/:containerId',
        element: <ContainerDetail />,
        children: [{
            path: 'overview',
            element: <ContainerDetailOverview />
        }, {
            path: 'inspect',
            element: <ContainerDetailInspect />
        }, {
            path: 'logs',
            element: <ContainerLogs />
        }, {
            path: 'exec',
            element: <ContainerExec />
        }, {
            path: 'statistics',
            element: <ContainerDetailStatistics />
        }, {
            path: 'settings',
            element: <ContainerDetailSettings />
        }]
    }, {
        path: '/images',
        element: <ImageList />
    }, {
        path: '/images/:imageId',
        element: <ImageDetail />
    }, {
        path: '/info',
        element: <SystemInfo />
    }]
}, {
    path: "/login",
    element: <Login />
}, {
    path: '/logout',
    element: <Logout />
}]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <CssBaseline />
      <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
      </ThemeProvider>
  </React.StrictMode>
);
