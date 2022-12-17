import { contextBridge, ipcRenderer } from 'electron'
import { Responses } from "nx-request-api";

export const api = {

  invoke: (message: string, object: Object): Promise<Responses.OkOrError> => {
    return ipcRenderer.invoke(message, object)
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },

  /**
   * Provide an easier way to listen to events
   */
   once: (channel: string, callback: Function) => {
    ipcRenderer.once(channel, (_, data) => callback(data))
  }

}

contextBridge.exposeInMainWorld('Main', api)

