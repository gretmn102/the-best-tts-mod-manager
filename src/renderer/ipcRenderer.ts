/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export const ipcRenderer = {
  once: (channel:string, fn: (arg:any) => void) => {
    (window as any).electron?.ipcRenderer.once(channel, (arg: any) => fn(arg))
  },
  send: (channel:string, msg: any) => {
    (window as any).electron?.ipcRenderer.send(channel, msg)
  },
  addListener: (channel:string, fn: (arg:any) => void) => {
    (window as any).electron?.ipcRenderer.addListener(channel, (res: any) => fn(res))
  },
}
