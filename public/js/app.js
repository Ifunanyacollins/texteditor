const  electron = require('electron')

const {ipcRenderer} = electron
const editor = document.querySelector('#editor')
const textInput = document.querySelector('#textInput')

window.addEventListener('load',(e)=>{
    textInput.focus()
})

window.addEventListener('contextmenu',(e)=>{
    ipcRenderer.send('open-context-menu')
})

ipcRenderer.on('load',(e,agrs)=>{
    textInput.innerHTML = agrs
})

ipcRenderer.on('getDocs',(e)=>{
    ipcRenderer.send('docs',textInput.value)
})

ipcRenderer.on('clear',(e)=>{
   textInput.value = ""
})