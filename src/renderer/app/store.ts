import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import backuperReducer, {BackuperState, initialState} from '../features/backuper/backuperSlice';

// saved from types
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    backuper: backuperReducer,
  },
});

export const store2 = (initialState:BackuperState) => configureStore({
  reducer: {
    counter: counterReducer,
    backuper: backuperReducer,
  },
  preloadedState: {
    // counter: initialState,
    backuper: initialState,
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
