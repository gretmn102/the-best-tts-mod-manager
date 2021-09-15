import * as E from 'fp-ts/lib/Either'
import * as State from './state'

export type ErrorMsg = string
export type ParseSaveResp = E.Either<ErrorMsg, State.SaveFileState>

export enum ReqT {
  PARSE_SAVE = 'PARSE_SAVE',
  DOWNLOAD_RESOURCE_BY_INDEX = 'DOWNLOAD_RESOURCE_BY_INDEX',
  DOWNLOAD_RESOURCES_BY_INDEXES = 'DOWNLOAD_RESOURCES_BY_INDEXES',
  REPLACE_URL = 'REPLACE_URL'
}

export type Req =
  | [ ReqT.PARSE_SAVE, string ]
  | [ ReqT.DOWNLOAD_RESOURCE_BY_INDEX, number ]
  | [ ReqT.DOWNLOAD_RESOURCES_BY_INDEXES, number [] ]
  | [ ReqT.REPLACE_URL, number, string ]

export enum RespT {
  PARSE_SAVE_RESULT = 'PARSE_SAVE_RESULT',
  DOWNLOAD_RESOURCE_BY_INDEX_RESULT = 'DOWNLOAD_RESOURCE_BY_INDEX_RESULT',
  RESOURCE_DOWNLOADED = 'RESOURCE_DOWNLOADED',
  DOWNLOAD_RESOURCES_BY_INDEXES_RESULT = 'DOWNLOAD_RESOURCES_BY_INDEXES_RESULT',
  REPLACE_URL_RESULT = 'REPLACE_URL',
}

export type Downloaded = [
  number,
  [State.LocalFileStateT.LOAD_ERROR, string] | [ State.LocalFileStateT.EXIST, State.AbsolutePath ]
]

export type Resp =
  | [ RespT.PARSE_SAVE_RESULT, ParseSaveResp ]
  | [ RespT.DOWNLOAD_RESOURCE_BY_INDEX_RESULT, E.Either<ErrorMsg, undefined> ]
  | [ RespT.RESOURCE_DOWNLOADED, Downloaded ]
  | [ RespT.DOWNLOAD_RESOURCES_BY_INDEXES_RESULT ]
  | [ RespT.REPLACE_URL_RESULT ]
export const channel = 'backup-channel'

export const getStateChannel = 'getStateChannel'

export type GetStateResult = State.State
