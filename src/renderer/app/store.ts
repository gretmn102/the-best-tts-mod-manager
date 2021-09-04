import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import backuperReducer, { BackuperState, initialState } from '../features/backuper/backuperSlice'
import thunkMiddleware from 'redux-thunk'

export const initStore = (initialState:BackuperState, send:(channel:string, msg:any) => void) => configureStore({
  reducer: {
    counter: counterReducer,
    backuper: backuperReducer,
  },
  preloadedState: {
    // counter: initialState,
    backuper: initialState,
  },
  middleware: [
    thunkMiddleware.withExtraArgument(send)
  ]
})

const wrapperStoreDispatch = (x:any) => initStore(x, x).dispatch
const wrapperStoreGetState = (x:any) => initStore(x, x).getState()

// export type AppDispatch = Pick<ReturnType<typeof store>, 'dispatch'> // ¯\_(ツ)_/¯
export type AppDispatch = ReturnType<typeof wrapperStoreDispatch>
export type RootState = ReturnType<typeof wrapperStoreGetState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  (channel: string, msg:any) => void,
  Action<string>
>
