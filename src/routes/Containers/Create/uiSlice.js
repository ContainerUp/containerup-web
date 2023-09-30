import {createSlice} from "@reduxjs/toolkit";

const total = 7;
const allFalse = [...new Array(total)].map(() => false);
const allZero = [...new Array(total)].map(() => 0);

const initialState = {
    open: [true, false, false, false, false, false, false],
    disabled: [false, true, true, true, true, true, true],
    version: allZero,
    edited: allFalse,
    dialogDiscardIntent: {
        index: 0,
        open: false
    },
    showDialogDiscard: false
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        reset: state => {
            return initialState;
        },
        toggle: {
            reducer(state, action) {
                if (action.payload.index === 0 && !action.payload.zeroHasImageDetail) {
                    // it's ok to open/close accordionNameImage
                    if (action.payload.open) {
                        // open only one
                        state.open = allFalse.map((val, idx) => idx === 0);
                        return;
                    }
                    // open none
                    state.open = allFalse;
                    return;
                }

                if (!action.payload.open && state.edited[action.payload.index]) {
                    // close current one
                    state.showDialogDiscard = true;
                    state.dialogDiscardIntent = {
                        index: action.payload.index,
                        open: action.payload.open
                    }
                    return;
                }

                if (action.payload.open) {
                    if (state.edited.indexOf(true) !== -1) {
                        // open other one
                        state.showDialogDiscard = true;
                        state.dialogDiscardIntent = {
                            index: action.payload.index,
                            open: action.payload.open
                        }
                        return;
                    }
                }

                // close all, or open only one
                state.open = allFalse.map((val, idx) => {
                    if (action.payload.index === idx) {
                        return action.payload.open;
                    }
                    return false;
                });
            },
            prepare(index, open, zeroHasImageDetail = false) {
                return {
                    payload: {
                        index,
                        open,
                        zeroHasImageDetail
                    }
                };
            }
        },
        openNext: (state, action) => {
            let idxToOpen = action.payload + 1;
            if (idxToOpen >= total) {
                idxToOpen = -1;
            }
            state.open = allFalse.map((v, idx) => idx === idxToOpen);
        },
        enableAll: state => {
            state.disabled = allFalse;
        },
        setEdited: {
            reducer(state, action) {
                state.edited[action.payload.index] = action.payload.edited;
            },
            prepare(index, edited) {
                return {
                    payload: {
                        index,
                        edited
                    }
                };
            }
        },
        closeDialog: state => {
            state.showDialogDiscard = false;
        },
        confirmDiscard: state => {
            const toReset = state.edited.indexOf(true);
            state.version[toReset] ++;
            state.edited[toReset] = false;
            state.showDialogDiscard = false;

            // close, or open only one
            state.open = allFalse.map((val, idx) => {
                if (state.dialogDiscardIntent.index === idx) {
                    return state.dialogDiscardIntent.open;
                }
                return false;
            });
        }
    }
});

export const uiActions = uiSlice.actions;

export default uiSlice.reducer;
