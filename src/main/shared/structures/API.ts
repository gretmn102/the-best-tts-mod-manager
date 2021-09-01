import * as E from "fp-ts/lib/Either"

export type Data = { urls: Array<string> }

export type ErrorMsg = string
export type ParseSaveResp = E.Either<ErrorMsg, Data>

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