import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    name: '',
    imageDetail: null,
    cmd: undefined,
    workDir: undefined,
    envs: [],
    volumes: [],
    ports: [],
    res: {
        cpuShares: 0,
        cpuCores: 0,
        memoryMB: 0,
        memorySwapMB: 0
    },
    adv: {
        start: true,
        alwaysRestart: false
    }
};

const containerSlice = createSlice({
    name: 'container',
    initialState,
    reducers: {
        reset: state => {
            return initialState;
        },
        setName: (state, action) => {
            state.name = action.payload;
        },
        setImageDetail: (state, action) => {
            state.imageDetail = action.payload;
        },
        setCmd: (state, action) => {
            state.cmd = action.payload;
        },
        setWorkDir: (state, action) => {
            state.workDir = action.payload;
        },
        setEnvs: (state, action) => {
            state.envs = action.payload;
        },
        setVolumes: (state, action) => {
            state.volumes = action.payload;
        },
        setPorts: (state, action) => {
            state.ports = action.payload;
        },
        setRes: (state, action) => {
            state.res = action.payload;
        },
        setAdv: (state, action) => {
            state.adv = action.payload;
        }
    }
});

export const containerActions = containerSlice.actions;

export default containerSlice.reducer;
