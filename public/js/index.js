const electron = require('electron')
const fs = require('fs')
const url = require('url')
const path = require('path')

const { BrowserWindow,MenuItem,Menu,dialog,app,ipcMain} = electron
let MainWindow;
let fileSelected;

const CreateMainWindow = () => {
   
  MainWindow = new BrowserWindow({
      show:false
  })

  MainWindow.loadURL(url.format({
      pathname:path.join(__dirname,'../index.html'),
      protocol:'file:',
      slashes:true
  }))

  MainWindow.once('ready-to-show',()=>{
      MainWindow.show()
  })

  MainWindow.on('closed',()=>{
      app.quit()
  })

}

app.on('ready',()=>{
    CreateMainWindow()
    const mainMenu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(mainMenu)
})

const menuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'New',
                click(){
                    fileSelected = ''
                    MainWindow.webContents.send('clear')
                }
            },
            {
             label:'Save',
             click(){
                MainWindow.webContents.send('getDocs')
             }
            },
            {
             type:'separator'
            },
            {
                label:'Open File',
                click(){
                    dialog.showOpenDialog(
                        {
                        properties:['openFile'],
                        filters:[
                            {
                                name:'Text',
                                extentions:['txt']
                            }
                        ]
                    },

                    function(files){
                      if(files){
                          fileSelected = files[0]
                          fs.readFile(files[0],  'utf-8',function(err,data){
                             if(err){
                                 throw Error(err)
                             }
                             MainWindow.webContents.send('load',data)
                          })
                      }
                    }
                )

                }
            }
        ]
    },

    
]

if(process.platform == 'darwin'){
    menuTemplate.unshift({})
}

if(process.env.NODE_ENV !== 'production'){
    menuTemplate.push(
        
        {
        label:'DevTools',
        submenu:[
            {
                label:'Chrome DevTool',
                accelerator:process.platform == 'darwin' ? 'command+I' : 'ctrl+I',
                click(item,focusedWindow){
                  focusedWindow.toggleDevTools()
                }
            },
            {
                label:'Reload',
                role:'reload'
            }
        ]
    })
}


// For The Context Menu

const contextMenu = new Menu()

contextMenu.append(new MenuItem({label:'Copy',role:'copy'}))
contextMenu.append(new MenuItem({label:'Cut',role:'cut'}))
contextMenu.append(new MenuItem({label:'Paste',role:'paste'}))

ipcMain.on('open-context-menu',({sender})=>{
    const windowOpen = BrowserWindow.fromWebContents(sender)
    contextMenu.popup(windowOpen)
})

ipcMain.on('docs',(e,args)=>{

if(fileSelected){
 
    fs.writeFile(fileSelected,args,(err)=>{
        if(err){
           console.log(err)
        }else{
            console.log('sucess')
        }
    })

}else{
  
    
    dialog.showSaveDialog(
        {
       
        filters:[
            {
                name:'Text',
                extentions:['txt']
            }
        ]
    },

    function(file){
    if(file){

        fs.writeFile(file,args,function(err){
            if(err){
                console.log(err)
            }
        })

    }else{
        console.log('no file')
    }
    }
)

}

})