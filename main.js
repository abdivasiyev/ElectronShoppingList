const electron = require('electron')
const url = require('url')
const path = require('path')

const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron

// Set environment
process.env.NODE_ENV = 'production';

let mainWindow, addWindow

// Listen for app to be ready
app.on('ready', function () {
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })

    // Load html into window
    mainWindow.loadURL(loadHtmlFile('mainWindow.html'))

    mainWindow.on('closed', function () {
        app.quit()
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    // Insert menu
    Menu.setApplicationMenu(mainMenu)
})

// Handle create add window
function createAddWindow() {
    // Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        },
        parent: mainWindow
    })

    // Load html into window
    addWindow.loadURL(loadHtmlFile('addWindow.html'))

    // Garbage collection handler
    addWindow.on('close', function () {
        addWindow = null
    })
}

// Catch item add
ipcMain.on('item:add', function (e, item) {
    mainWindow.webContents.send('item:add', item)
    addWindow.close()
})

// Create menu template
const mainMenuTemplate = [{
    label: 'File',
    submenu: [{
            label: 'Add Item',
            click() {
                createAddWindow()
            }
        },
        {
            label: 'Clear Items',
            click() {
                mainWindow.webContents.send('item:clear')
            }
        },
        {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click() {
                app.quit()
            }
        }
    ]
}]

// If mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({})
}

function loadHtmlFile(fileName) {
    return url.format({
        pathname: path.join(__dirname, fileName),
        protocol: 'file:',
        slashes: true
    })
}

// Add developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
                label: 'Toggle DevTools',
                accelerator: 'CmdOrCtrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}