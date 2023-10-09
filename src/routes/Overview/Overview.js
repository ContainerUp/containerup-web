import {useEffect, useState} from "react";
import {aioProvider, isDisconnectError} from "../../lib/dataProvidor";
import dataModel from "../../lib/dataModel";
import {showWebsocketDisconnectError} from "../../components/WebsocketDisconnectError";
import {closeSnackbar, enqueueSnackbar} from "notistack";
import {useNavigate} from "react-router-dom";
import {Doughnut} from "react-chartjs-2";
import {Box, Card, CardContent, Stack} from "@mui/material";
import Typography from "@mui/material/Typography";

const minPerc = 0.01;
const loadingColor = 'rgb(100, 100, 100)';

const makeOptions = (title, unit) => {
    return {
        maintainAspectRatio: false,
        rotation: -90,
        circumference: 180,
        parsing: {
            key: 'val'
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title,
            },
            tooltip: {
                callbacks: {
                    label: item => {
                        if (item.raw.loading) {
                            return '';
                        }
                        let val = item.raw.raw.toFixed(2);
                        return `${val} ${unit}`;
                    },
                },
            }
        }
    };
};

const makeData = () => {
    return {
        labels: [
            'Podman',
            'Other',
            'Available'
        ],
        datasets: [{
            data: [{val: 0, raw: 0}, {val: 0, raw: 0}, {val: 1, raw: 0}],
            backgroundColor: [
                'rgb(123, 31, 162)',
                'rgb(235,163,54)',
                'rgb(220,220,220)'
            ]
        }]
    };
};

export default function Overview() {
    const navigate = useNavigate();

    const [cpuOptions] = useState(() => makeOptions("CPU", "%"));
    const [cpuData, setCpuData] = useState(() => makeData());
    const [memOptions] = useState(() => makeOptions("Memory", "MB"));
    const [memData, setMemData] = useState(() => makeData());

    const [ctnTotal, setCtnTotal] = useState(0);
    const [ctnRunning, setCtnRunning] = useState(0);
    const [imgTotal, setImgTotal] = useState(0);
    const [imgInUse, setImgInUse] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const snackbarKeys = [];
        let count = 0;

        const onData = data => {
            setLoading(false);

            if (!data) {
                snackbarKeys.push(enqueueSnackbar("The statistics data stream is ended.", {variant: 'warning'}));
                return;
            }

            count ++;

            {
                const cpu_podman = parseFloat((data.cpu_podman * 100).toFixed(2));
                const cpu_other = parseFloat((data.cpu_other * 100).toFixed(2));
                const cpu_total = data.cpu_total * 100;
                const cpu_idle = cpu_total - cpu_podman - cpu_other;

                const cpuData = makeData();
                cpuData.datasets[0].data = [{
                    val: cpu_podman < cpu_total * minPerc && count > 1 ? cpu_total * minPerc : cpu_podman,
                    raw: cpu_podman
                }, {
                    val: cpu_other < cpu_total * minPerc && count > 1 ? cpu_total * minPerc : cpu_other,
                    raw: cpu_other
                }, {
                    val: cpu_idle < cpu_total * minPerc && count > 1 ? cpu_total * minPerc : cpu_idle,
                    raw: cpu_idle
                }];
                if (count < 2) {
                    cpuData.datasets[0].data[2].loading = true;
                    cpuData.datasets[0].backgroundColor[2] = loadingColor;
                    cpuData.labels[2] = 'Loading';
                }
                setCpuData(cpuData);
            }

            {
                const mem_podman = parseFloat((data.mem_podman / 1024 / 1024).toFixed(2));
                const mem_other = parseFloat((data.mem_other / 1024 / 1024).toFixed(2));
                const mem_total = parseFloat((data.mem_total / 1024 / 1024).toFixed(2));
                const mem_idle = mem_total - mem_podman - mem_other;

                const memData = makeData();
                memData.datasets[0].data = [{
                    val: mem_podman < mem_total * minPerc ? mem_total * minPerc : mem_podman,
                    raw: mem_podman
                }, {
                    val: mem_other < mem_total * minPerc ? mem_total * minPerc : mem_other,
                    raw: mem_other
                }, {
                    val: mem_idle < mem_total * minPerc ? mem_total * minPerc : mem_idle,
                    raw: mem_idle
                }];
                setMemData(memData);
            }

            setCtnTotal(data.containers_total);
            setCtnRunning(data.containers_running);
            setImgTotal(data.images_total);
            setImgInUse(data.images_in_use);
        };

        const onError = error => {
            setLoading(false);

            if (dataModel.errIsNoLogin(error)) {
                let query = new URLSearchParams();
                query.append('cb', '/overview');
                navigate('/login?' + query.toString());
                return;
            }
            let e = error.toString();
            if (error.response) {
                e = error.response.data;
            }
            if (isDisconnectError(error) || count) {
                snackbarKeys.push(showWebsocketDisconnectError());
            } else {
                snackbarKeys.push(enqueueSnackbar(e, {
                    variant: "error",
                    persist: true
                }));
            }
        };

        const cancel = aioProvider().systemStats(onData, onError);
        return () => {
            cancel();
            for (const key of snackbarKeys) {
                closeSnackbar(key);
            }
        };
    }, [navigate]);

    return (
        <Box sx={{width: 800}}>
            <Card>
                <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom align="center">
                        System performance
                    </Typography>

                    <Stack direction="row" sx={{height: 200}}>
                        <Box sx={{width: 350, mr: '68px'}}>
                            <Doughnut
                                options={cpuOptions}
                                data={cpuData}
                            />
                        </Box>


                        <Box sx={{width: 350}}>
                            <Doughnut
                                options={memOptions}
                                data={memData}
                            />
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Stack direction="row" sx={{mt: '16px', width: 800}}>
                <Card sx={{width: 392}}>
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom align="center">
                            Containers
                        </Typography>
                        <Typography component="div" sx={{lineHeight: 3}}>
                            Total: {loading ? '...' : ctnTotal}
                        </Typography>
                        <Typography component="div">
                            Running: {loading ? '...' : ctnRunning}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ml: '16px', width: 392}}>
                    <CardContent>
                        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom align="center">
                            Images
                        </Typography>
                        <Typography component="div" sx={{lineHeight: 3}}>
                            Total: {loading ? '...' : imgTotal}
                        </Typography>
                        <Typography component="div">
                            Running: {loading ? '...' : imgInUse}
                        </Typography>
                    </CardContent>

                </Card>
            </Stack>


        </Box>

    );
}