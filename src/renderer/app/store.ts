import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import backuperReducer, { BackuperState, initialState } from '../features/backuper/backuperSlice'

export const store = (initialState:BackuperState) => configureStore({
  reducer: {
    counter: counterReducer,
    backuper: backuperReducer,
  },
  preloadedState: {
    // counter: initialState,
    backuper: initialState,
  },
})

const wrapperStoreDispatch = (x:any) => store(x).dispatch
const wrapperStoreGetState = (x:any) => store(x).getState()

// export type AppDispatch = Pick<ReturnType<typeof store>, 'dispatch'> // ¯\_(ツ)_/¯
export type AppDispatch = ReturnType<typeof wrapperStoreDispatch>
export type RootState = ReturnType<typeof wrapperStoreGetState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
