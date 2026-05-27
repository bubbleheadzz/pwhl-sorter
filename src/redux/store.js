import { configureStore } from '@reduxjs/toolkit';
import sorterReducer from './sorterSlice';

const store = configureStore({
  reducer: {
    sorter: sorterReducer,
  },
});

export default store;
