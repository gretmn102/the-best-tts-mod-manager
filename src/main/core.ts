import * as E from "fp-ts/lib/Either"
import * as API from "../shared/API";
import * as SharedState from "../shared/state";
import { MainT } from "../shared/state";
import parseSave from "./main/tts_save_file";

export let state:SharedState.State = [ MainT.NOT_STARTED_SAVE_FILE_YET ]

export function handle(req:API.Req): Promise<API.Resp> {
  switch (req[0]) {
    case API.ReqT.PARSE_SAVE:
      let [, savePath] = req

      if (state[0] == MainT.SAVE_FILE_HANDLE) {
        const res:API.Resp = [API.RespT.PARSE_SAVE_RESULT, E.left('save file already set')] // TODO: reload save file
        return Promise.resolve(res)
      } else {
        return parseSave(savePath)
          .then(xs => {
            const urls = Array.from(xs).map(x => x.extractedUrl)
            const saveFileState:SharedState.SaveFileState = {
              resources: urls.map(x => {
                return {
                  fileState: [ SharedState.LocalFileStateT.NOT_EXIST ], // TODO
                  url: x,
                }
              })
            }
            state = [
              MainT.SAVE_FILE_HANDLE,
              saveFileState
            ]

            const res:API.Resp = [API.RespT.PARSE_SAVE_RESULT, E.right(saveFileState)]
            return res
          })
          .catch((err:Error) => {
            const res:API.Resp = [API.RespT.PARSE_SAVE_RESULT, E.left(err.message)]
            return res
          })
      }
      break;

    default:
      fail(`Unknown request: ${req}`);
      break;
  }
}