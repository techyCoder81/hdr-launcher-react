import { contextBridge, ipcRenderer } from 'electron'
import { Responses } from "nx-request-api";

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.send`
   */

  send: (message: string, object: Object) => {
    ipcRenderer.send(message, object)
  },

  invoke: (message: string, object: Object): Promise<Responses.BaseResponse> => {
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
