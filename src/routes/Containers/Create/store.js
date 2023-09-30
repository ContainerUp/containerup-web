import {configureStore} from "@reduxjs/toolkit";
import containerReducer from './containerSlice';
import uiReducer from './uiSlice';

export default configureStore({
    reducer: {
        container: containerReducer,
        ui: uiReducer
    }
});
