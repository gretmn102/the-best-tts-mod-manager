import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as E from 'fp-ts/Either'
import { AppThunk, RootState } from '../../app/store';
import * as API from '../../../shared/API'

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

const initialState: BackuperState = {
  value: '',
  status: [States.IDLE],
};

export const backuperSlice = createSlice({
  name: 'backuper',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setResult: (state, action: PayloadAction<API.ParseSaveResp>) => {
      state.status = <ResultState>[States.RESOLVED, action.payload];
    },
    parseSaveReq: (state, action: PayloadAction<string>) => {
      (window as any).electron.ipcRenderer.send(API.channel, [API.ReqT.PARSE_SAVE, action.payload])
      state.status = [States.LOADING]
      state.value = action.payload
    }
  },
});

export const { setResult: setValue, parseSaveReq } = backuperSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.backuper.value)`
export const selectStatus = (state: RootState) => state.backuper.status;

export const parse = (resp:API.Resp): AppThunk => (
    dispatch,
    getState
  ) => {
    switch (resp[0]) {
      case API.RespT.PARSE_SAVE_RESULT:
        let [, res] = resp
        console.log(`dispatch ${res}`);
        dispatch(setValue(res))
        break;

      default:
        console.log(`Unknown response: ${resp}`);
        break;
    }
  }

export default backuperSlice.reducer;
