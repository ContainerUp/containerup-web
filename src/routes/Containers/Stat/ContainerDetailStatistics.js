import {useEffect, useRef} from "react";
import {aioProvider} from "../../../lib/dataProvidor";
import {useParams} from "react-router-dom";
import {Line} from "react-chartjs-2";
import {Box} from "@mui/material";
import {enqueueSnackbar} from "notistack";
import {styled} from "@mui/material/styles";

const makeOptions = (title, options) => {
    const opt = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                display: false
            },
            y: {
                type: 'linear',
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'x',
            intersect: false
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
    };

    if (options) {
        if (options.stepSize) {
            opt.scales.y.ticks = {stepSize: options.stepSize};
        }
        if (options.suggestedMax) {
            opt.scales.y.suggestedMax = options.suggestedMax;
        }
    }

    return opt;
};

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
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }, {
        label: l2,
        fill: false,
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }]
});

const ChartWrapper = styled(Box)(({theme}) => ({
    height: 250,
    width: '50%',
    padding: 20,
    [theme.breakpoints.down('md')]: {
        width: '99%',
        maxWidth: '450px'
    }
}));

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
        <Box sx={{display: 'flex', maxWidth: 1200, flexWrap: 'wrap'}}>
            <ChartWrapper>
                <Line
                    ref={chartCpuRef}
                    options={makeOptions('CPU %', {suggestedMax: 1})}
                    data={makeData()}
                />
            </ChartWrapper>
            <ChartWrapper>
                <Line
                    ref={chartMemRef}
                    options={makeOptions('Memory MB', {suggestedMax: 32})}
                    data={makeData()}
                />
            </ChartWrapper>

            <ChartWrapper>
                <Line
                    ref={chartNetRef}
                    options={makeOptions('Network MB/s', {suggestedMax: 0.1})}
                    data={makeDataInOut(["In", "Out"])}
                />
            </ChartWrapper>
            <ChartWrapper>
                <Line
                    ref={chartBlockRef}
                    options={makeOptions('Block IO MB/s', {suggestedMax: 0.1})}
                    data={makeDataInOut(["Read", "Write"])}
                />
            </ChartWrapper>
        </Box>
    );
}