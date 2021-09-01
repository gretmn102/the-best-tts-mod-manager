export enum LocalFileStateT {
  NOT_EXIST = 'NOT_EXIST',
  EXIST = 'EXIST',
  LOADING = 'LOADING',
}
export type LocalFileState =
  | [ LocalFileStateT.LOADING ]
  | [ LocalFileStateT.NOT_EXIST ]
  | [ LocalFileStateT.EXIST, string ]

export type Resource = {
  fileState: LocalFileState
  url: string
}

export type SaveFileState = {
  resources: Resource []
}

export enum MainT {
  NOT_STARTED_SAVE_FILE_YET = 'NOT_STARTED_SAVE_FILE_YET',
  SAVE_FILE_HANDLE = 'SAVE_FILE_HANDLE',
}

export type State =
  | [ MainT.NOT_STARTED_SAVE_FILE_YET ]
  | [ MainT.SAVE_FILE_HANDLE, SaveFileState ]