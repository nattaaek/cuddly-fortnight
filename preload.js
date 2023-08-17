const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  csvUpload: (filePath) => ipcRenderer.send('csv-upload', filePath)
})


