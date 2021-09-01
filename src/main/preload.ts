import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(channel:any, arg:any) {
      ipcRenderer.send(channel, arg);
    },
    on(channel:any, func:any) {
      const validChannels = [channel];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel:any, func:any) {
      const validChannels = [channel];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
    addListener(channel:any, func:any) {
      const validChannels = [channel];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.addListener(channel, (event, ...args) => func(...args));
      }
    },
  },
});