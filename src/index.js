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

import Root from './routes/Root'
import Login from './routes/Login'
import ContainersList from "./routes/Containers/List/ContainersList";
import Images from "./routes/Images";
import ContainerDetail from "./routes/Containers/ContainerDetail";
import ContainerDetailOverview from "./routes/Containers/ContainerDetailOverview";
import ContainerDetailInspect from "./routes/Containers/ContainerDetailInspect";
import ContainerLogs from "./routes/Containers/ContainerLogs/ContainerLogs";
import ContainerDetailStatistics from "./routes/Containers/ContainerDetailStatistics";
import ContainerShell from "./routes/Containers/ContainerShell/ContainerShell";
import ContainerDetailSettings from "./routes/Containers/ContainerDetailSettings";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        children: [
            {
                path: '/containers',
                element: <ContainersList />,
                children: [

                ]
            },
            {
                path: '/containers/:containerId',
                element: <ContainerDetail />,
                children: [
                    {
                        path: 'overview',
                        element: <ContainerDetailOverview />
                    },
                    {
                        path: 'inspect',
                        element: <ContainerDetailInspect />
                    },
                    {
                        path: 'logs',
                        element: <ContainerLogs />
                    },
                    {
                        path: 'exec',
                        element: <ContainerShell />
                    },
                    {
                        path: 'statistics',
                        element: <ContainerDetailStatistics />
                    },
                    {
                        path: 'settings',
                        element: <ContainerDetailSettings />
                    }
                ]
            },
            {
                path: '/images',
                element: <Images />
            }
        ]
    },
    {
        path: "/login",
        element: <Login />
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <CssBaseline />
      <RouterProvider router={router} />
  </React.StrictMode>
);
