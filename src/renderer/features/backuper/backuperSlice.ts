import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as E from 'fp-ts/Either'
import { AppThunk, RootState } from '../../app/store';
import * as API from '../../../shared/API'
import { pipe } from 'fp-ts/lib/function';
import * as SharedState from '../../../shared/state';

export enum States {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  RESOLVED = 'RESOLVED'
}

export type ResultState =
  | [States.IDLE]
  | [States.LOADING]
  | [States.RESOLVED, API.ParseSaveResp]

export interface BackuperState {
  value: string;
  status: ResultState;
}

export const initialState: BackuperState = {
  value: '',
  status: [States.IDLE],
};

export const backuperSlice = createSlice({
  name: 'backuper',
  initialState: initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setResult: (state, action: PayloadAction<API.ParseSaveResp>) => {
      state.status = [States.RESOLVED, action.payload]
    },
    parseSaveReq: (state, action: PayloadAction<string>) => {
      (window as any).electron.ipcRenderer.send(API.channel, [API.ReqT.PARSE_SAVE, action.payload])
      state.status = [States.LOADING]
      state.value = action.payload
    },
    downloadResourceByIndex: (state, action: PayloadAction<number>) => {
      if (state.status[0] == States.RESOLVED) {
        const [, x] = state.status

        pipe(x, E.map((x) => {
          (window as any).electron.ipcRenderer.send(API.channel, [API.ReqT.DOWNLOAD_RESOURCE_BY_INDEX, action.payload])
          x.resources[action.payload].fileState = [SharedState.LocalFileStateT.LOADING]
          return undefined
        }))
      }
    },
    setResource: (state, action: PayloadAction<API.Downloaded>) => {
      if (state.status[0] == States.RESOLVED) {
        const [, x] = state.status

        const [idx, res] = action.payload
        pipe(x, E.map((x) => {
          x.resources[idx].fileState = res
          return undefined
        }))
      }
    },
  },
});

export const {
  setResult,
  parseSaveReq,
  downloadResourceByIndex,
  setResource
} = backuperSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.backuper.value)`
export const selectStatus = (state: RootState) => state.backuper.status;

export const parse = (resp:API.Resp): AppThunk => (
  dispatch,
  getState
) => {
  switch (resp[0]) {
    case API.RespT.PARSE_SAVE_RESULT: {
      const [, res] = resp
      console.log(`dispatch ${res}`);
      dispatch(setResult(res))
    } break
    case API.RespT.RESOURCE_DOWNLOADED: {
      const [, res] = resp
      dispatch(setResource(res))
    } break
    case API.RespT.DOWNLOAD_RESOURCE_BY_INDEX_RESULT: {
      const [, res] = resp
      pipe(res, E.mapLeft(msgErr => {
        throw new Error(msgErr)
      }))
    } break
  }
}

export default backuperSlice.reducer;
