import * as E from "fp-ts/lib/Either"
import { parseSave } from "./main/tts_save_file"
import * as API from "./shared/structures/API"

window.addEventListener('message', (event) => {
  console.log(`Req: ${event.source} ${event.data}`);

  var req = <API.Req>event.data
  switch (req[0]) {
    case API.ReqT.PARSE_SAVE:
      let [, savePath] = req

      parseSave(savePath)
      .then(x => {
        const res = <API.Resp>[API.RespT.PARSE_SAVE_RESULT, E.right({ urls: Array.from(x).map(x => x.extractedUrl) })]
        window.postMessage(res, "*")
      })
      .catch((err:Error) => {
        const res = <API.Resp>[API.RespT.PARSE_SAVE_RESULT, E.left(err.message)]
        window.postMessage(res, "*")
      })
      break;

    default:
      console.log(`Unknown ${req}`);
      break;
  }
})
