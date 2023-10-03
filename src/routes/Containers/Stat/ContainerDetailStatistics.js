import {useEffect, useRef} from "react";
import {aioProvider} from "../../../lib/dataProvidor";
import {useParams} from "react-router-dom";
import {Line} from "react-chartjs-2";
import {Box, Stack} from "@mui/material";
import {enqueueSnackbar} from "notistack";

const makeOptions = (title, stepSize) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            type: 'time',
            display: false
        },
        y: {
            type: 'linear',
            beginAtZero: true,
            ticks: {
                stepSize
            }
        }
    },
    interaction: {
        mode: 'x'
    },
    plugins: {
        legend: {
            display: false
        },
        title: {
            display: true,
            text: title,
        },
    }
});

const makeData = () => ({
    datasets: [{
        fill: true,
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
});

const makeDataInOut = ([l1, l2]) => ({
    datasets: [{
        label: l1,
        fill: false,
        data: [],
        borderColor: 'rgb(53, 162, 235)'
    }, {
        label: l2,
        fill: false,
        data: [],
        borderColor: 'rgb(255, 99, 132)'
    }]
});

export default function ContainerDetailStatistics() {
    const {containerId} = useParams();
    const chartCpuRef = useRef();
    const chartMemRef = useRef();
    const chartNetRef = useRef();
    const chartBlockRef = useRef();

    useEffect(() => {
        let [netInLast, netOutLast, blockInLast, blockOutLast] = [-1, -1, -1, -1];
        const onData = data => {
            const chartCpu = chartCpuRef.current;
            const chartMem = chartMemRef.current;
            const chartNet = chartNetRef.current;
            const chartBlock = chartBlockRef.current;
            const charts = [chartCpu, chartMem, chartNet, chartBlock];

            if (data.Stats && data.Stats.length === 1) {
                const d = data.Stats[0];
                const now = Date.now();

                charts.forEach(chart => {
                    chart.options.scales.x.min = now - 3 * 60 * 1000;
                });

                if (chartCpu) {
                    const cpu = d.CPU;
                    chartCpu.data.datasets[0].data.push({x: now, y: cpu});
                }
                if (chartMem) {
                    const mem = d.MemUsage / 1024 / 1024;
                    chartMem.data.datasets[0].data.push({x: now, y: mem});
                }
                if (chartNet) {
                    const [netIn, netOut] = [d.NetInput, d.NetOutput];
                    if (netInLast >= 0) {
                        const [dIn, dOut] = [netIn - netInLast, netOut - netOutLast];
                        chartNet.data.datasets[0].data.push({x: now, y: dIn / 1024 / 1024});
                        chartNet.data.datasets[1].data.push({x: now, y: dOut / 1024 / 1024});
                    }
                    [netInLast, netOutLast] = [netIn, netOut];
                }
                if (chartBlock) {
                    const [blockIn, blockOut] = [d.BlockInput, d.BlockOutput];
                    if (blockInLast >= 0) {
                        const [dIn, dOut] = [blockIn - blockInLast, blockOut - blockOutLast];
                        chartBlock.data.datasets[0].data.push({x: now, y: dIn / 1024 / 1024});
                        chartBlock.data.datasets[1].data.push({x: now, y: dOut / 1024 / 1024});
                    }
                    [blockInLast, blockOutLast] = [blockIn, blockOut];
                }

                charts.forEach(chart => {
                    for (;chart.data.datasets[0].data.length > 60 / 5 * 3;) {
                        chart.data.datasets[0].data.pop();
                    }
                    if (chart.data.datasets[1]) {
                        for (;chart.data.datasets[1].data.length > 60 / 5 * 3;) {
                            chart.data.datasets[1].data.pop();
                        }
                    }
                    chart.update();
                });
            }
        };

        const onError = error => {
            enqueueSnackbar(error.toString(), {variant: 'error'});
        };

        const cancel = aioProvider().containerStatistics(containerId, onData, onError);
        return () => cancel();
    }, [containerId]);

    return (
        <Stack spacing={5}>
            <Stack direction="row" spacing={5} sx={{height: 250}}>
                <Box sx={{width: 400}}>
                    <Line ref={chartCpuRef} options={makeOptions('CPU %', 0.1)} data={makeData()} />
                </Box>
                <Box sx={{width: 400}}>
                    <Line ref={chartMemRef} options={makeOptions('Memory MB', 0.5)} data={makeData()} />
                </Box>
            </Stack>

            <Stack direction="row" spacing={5} sx={{height: 250}}>
                <Box sx={{width: 400}}>
                    <Line ref={chartNetRef} options={makeOptions('Network MB/s', 0.5)} data={makeDataInOut(["In", "Out"])} />
                </Box>
                <Box sx={{width: 400}}>
                    <Line ref={chartBlockRef} options={makeOptions('Block IO MB/s', 0.5)} data={makeDataInOut(["Read", "Write"])} />
                </Box>
            </Stack>
        </Stack>
    );
}