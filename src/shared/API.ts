import * as E from "fp-ts/lib/Either"
import * as State from "./state"

export type ErrorMsg = string
export type ParseSaveResp = E.Either<ErrorMsg, State.SaveFileState>

export enum ReqT {
  PARSE_SAVE = 'PARSE_SAVE'
}

export type Req =
  | [ ReqT.PARSE_SAVE, string ]

export enum RespT {
  PARSE_SAVE_RESULT = 'PARSE_SAVE_RESULT'
}

export type Resp =
  | [ RespT.PARSE_SAVE_RESULT, ParseSaveResp ]

export const channel = 'backup-channel'

export const getStateChannel = 'getStateChannel'

export type GetStateResult = State.State