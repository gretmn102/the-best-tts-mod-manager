export enum LocalFileStateT {
  NOT_EXIST = 'NOT_EXIST',
  EXIST = 'EXIST',
  LOADING = 'LOADING',
  LOAD_ERROR = 'LOAD_ERROR'
}
export type AbsolutePath = string
export type LocalFileState =
  | [ LocalFileStateT.LOADING ]
  | [ LocalFileStateT.LOAD_ERROR, string ]
  | [ LocalFileStateT.NOT_EXIST ]
  | [ LocalFileStateT.EXIST, AbsolutePath ]

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

export type SaveState =
  | [ MainT.NOT_STARTED_SAVE_FILE_YET ]
  | [ MainT.SAVE_FILE_HANDLE, SaveFileState ]
export type State = {
  saveState: SaveState,
  resourcesDir: string
}
