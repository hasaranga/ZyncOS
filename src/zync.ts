
import * as ImGui from "../imgui/imgui.js";
import { createFs, CreateFsOutput } from 'indexeddb-fs';
import {ReadDirectoryDecoratorOutput} from '../node_modules/indexeddb-fs/dist/framework/parts';
import {SetupZyncTheme, isMobile} from './zynctheme'

type char = number;
type int = number;
type short = number;
type float = number;
type double = number;

const FLT_MIN: float = 1.175494e-38;
const FLT_MAX: float = 3.402823e+38;

function UNIQUE(key: string): string { return key; }

class Static<T> {
    constructor(public value: T) {}
    access: ImGui.Access<T> = (value: T = this.value): T => this.value = value;
}

const _static_map: Map<string, Static<any>> = new Map();

function STATIC<T>(key: string, init: T): Static<T> {
    let value: Static<T> | undefined = _static_map.get(key);
    if (value === undefined) { _static_map.set(key, value = new Static<T>(init)); }
    return value;
}

const MAX_TEXT_FILE_SIZE = 1024*128;
const MAX_FILE_NAME_LENGTH = 64;

const show_system_editor = STATIC<boolean>(UNIQUE("show_system_editor#10001"), false);
const show_system_about = STATIC<boolean>(UNIQUE("show_system_about#10002"), false);
const show_system_logs = STATIC<boolean>(UNIQUE("show_system_logs#10003"), false);

let systemEditorOpenedFileName: string = "";
let systemEditorShouldOpenFile = false;
let systemEditorTextBuffer =  new ImGui.StringBuffer(MAX_TEXT_FILE_SIZE, "");
let systemEditorNewFileNameBuffer =  new ImGui.StringBuffer(MAX_FILE_NAME_LENGTH, "");
let systemTime: string = "";
let systemTimeTextWidth: number;
let systemTimeLastUpdate: number = 0;
let systemLog: ImGui.Vector<string> = new ImGui.Vector<string>();

let rootDirData: ReadDirectoryDecoratorOutput;
let fileSystem: CreateFsOutput;
let shouldShowNewFileInputBox = false;
let shouldCloseNewFileInputPopUp = false;
let shouldShowDeleteFilePopUp = false;

const runningOnMobile = isMobile();

let appCollection: Array<{ appName: string, fileName: string, code: string,
    appState: any, appVisible: any, appClosed: boolean }> = Array();

async function registerApp(appName: string, fileName: string)
{
    if (await fileSystem.exists("root/"+fileName))
    {
        let code = await fileSystem.readFile("root/"+fileName);
        let appVisible = STATIC<boolean>(UNIQUE(fileName), false);
        appCollection.push({ appName: appName, fileName: fileName, code: code, 
            appState: null, appVisible: appVisible, appClosed: true });
    }
    else{
        addToSystemLog("[error] app register => "+fileName+" does not exist!");
        //console.log("App: "+fileName+" does not exists!")
    }
}

function addToSystemLog(text: string)
{
    systemLog.push_back(text);
}

// units to pixel
function U2P(valueInUnits: number)
{
    if(!runningOnMobile)
        return valueInUnits;
    return Math.round(valueInUnits * (1366.0/window.innerWidth));
}

function updateSystemTime()
{
    systemTime = new Date().toLocaleTimeString('en-US', { hour12: true, 
        hour: "numeric", 
        minute: "numeric"});

    systemTimeTextWidth = ImGui.CalcTextSize(systemTime).x;
}

function makeNextWindowCenter()
{
    const center = ImGui.GetMainViewport().GetCenter();
    ImGui.SetNextWindowPos(center, ImGui.Cond.Appearing, new ImGui.Vec2(0.5, 0.5));    
}

async function clearFileSystem()
{
    rootDirData = await fileSystem.readDirectory("root");
    for(let file of rootDirData.files) 
    {       
        await fileSystem.removeFile(file.fullPath);
    }
    rootDirData = await fileSystem.readDirectory("root");
}

async function readFileSystem()
{
    rootDirData = await fileSystem.readDirectory("root");
}

async function loadFileSystem()
{
    if (await fileSystem.exists('root/boot.js'))
    {
        console.log("boot file exists"); 
        addToSystemLog("[system] reading file system");
        await readFileSystem();
        runBootJS();
    }
    else{
        console.log("creating file system");
        addToSystemLog("[system] downloading file system");
        // download & create file system
        const url = "filesystem.zfs"
        fetch(url)
           .then( r => r.text() )
           .then( t => createFileSystemFromJSONText(t));
    }
}

function createDownload(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

// https://stackoverflow.com/questions/19038919/is-it-possible-to-upload-a-text-file-to-input-in-html-js
function createUploadAndReadFile() {
    return new Promise((resolve) => {
        // create file input
        const uploader = document.createElement('input');
        uploader.type = 'file';
        uploader.style.display = 'none';

        // listen for files
        uploader.addEventListener('change', () => {
            const files = uploader.files;

            if (files!.length) {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    uploader.parentNode!.removeChild(uploader);
                    resolve(reader.result);
                })
                reader.readAsText(files![0]);
            }
        })

        // trigger input
        document.body.appendChild(uploader);
        uploader.click();
    })
}


async function exportFileSystem()
{
    let fileCollection: Array<{ fileName: string, content: string }> = Array();

    for(let file of rootDirData.files) 
    {       
        let fileContent : string = await fileSystem.readFile(file.fullPath);
        fileCollection.push({ fileName: file.name, content: btoa(fileContent) });
    }

    let data = JSON.stringify(fileCollection);
    var today = new Date();
    var date = today.getFullYear()+''+(today.getMonth()+1)+''+today.getDate();
    var time = today.getHours()+''+today.getMinutes();
    let fileName = "filesystem-" +date+"-"+time+".zfs";
    createDownload(fileName, data);
}

async function createFileSystemFromJSONText(text: string)
{
    let fileCollection: Array<{ fileName: string, content: string }> = JSON.parse(text);
    await clearFileSystem();
    for(let item of fileCollection)
    {
        await fileSystem.writeFile("root/" + item.fileName, atob(item.content));
    }
    await readFileSystem(); 
    await runBootJS();
}

async function importFileSystem()
{
    const text = await createUploadAndReadFile();
    if(text)
    {
        await createFileSystemFromJSONText(text.toString());
        systemEditorTextBuffer = new ImGui.StringBuffer(MAX_TEXT_FILE_SIZE, "");
        systemEditorOpenedFileName = "";     
        setTimeout(function (){location.reload()}, 5000);   
    }
}

async function readFileContentToBuffer(path: string)
{
    const fileContent = await fileSystem.readFile(path);
    systemEditorTextBuffer = new ImGui.StringBuffer(MAX_TEXT_FILE_SIZE, fileContent);
}

async function saveBufferToFile(path: string)
{
    await fileSystem.writeFile(path, systemEditorTextBuffer.buffer);

}

async function runBootJS()
{
    let source = await fileSystem.readFile("root/boot.js");

    addToSystemLog("[system] executing boot.js");
    try {
        eval(source);
    } catch (e: any) {
        addToSystemLog("[error] boot.js: "+e.message);
        //console.log("boot.js: "+e.message);
    }
}

async function updateIfApplication(fileName: string)
{
    for(let i =0; i<appCollection.length; i++)
    {
        if(fileName === appCollection[i].fileName)
        {
            appCollection[i]= { appName: appCollection[i].appName, fileName: fileName, code: systemEditorTextBuffer.buffer, 
                appState: appCollection[i].appState, appVisible: appCollection[i].appVisible,
                appClosed: appCollection[i].appClosed };
            break;
        }
    }
}

async function runApplications()
{
    for(let app of appCollection)
    {
        if(!app.appClosed)
        {
            try {
                let appState = app.appState;
                let appVisible = app.appVisible;
                let appClosed = app.appClosed;
                eval(app.code);
                app.appState = appClosed ? null : appState;
                app.appVisible.value =  appClosed ? true : appVisible.value;
                app.appClosed = appClosed;
            } catch (e: any) {
                addToSystemLog("[error] "+app.fileName+": "+e.message);
                app.appClosed = true;
                app.appVisible.value = false;
                app.appState = null;
            }  
        }         
    }
}

export function ZyncSetup() {
    addToSystemLog("[system] booting ZyncOS " + (runningOnMobile ? "(mobile)":"(desktop)"));

    addToSystemLog("[system] checking file system");   
    fileSystem = createFs({});
    loadFileSystem();  

    SetupZyncTheme();
}

export function ZyncLoop() {

    const main_viewport = ImGui.GetMainViewport();
    const screenWidth = main_viewport.Size.x;
    const screenHeight = main_viewport.Size.y;

    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.Vec2(10, 10));
    ImGui.PushStyleVar(ImGui.StyleVar.ItemSpacing, new ImGui.Vec2(10, 10));   
    if (ImGui.BeginMainMenuBar())
    {
        if (ImGui.BeginMenu("Applications"))
        {
            for(let app of appCollection)
            {
                if(ImGui.MenuItem(app.appName)){
                    app.appClosed = false;
                    app.appVisible.value = true;
                }
            }

            ImGui.EndMenu();
        }

        if (ImGui.BeginMenu("System"))
        {
            if(ImGui.MenuItem("System Editor")){
                show_system_editor.value = true;
            }

            if(ImGui.MenuItem("Logs...")){
                show_system_logs.value = true;
            }

            ImGui.EndMenu();
        }        

        if (ImGui.BeginMenu("Help"))
        {
            if(ImGui.MenuItem("About...")){
                show_system_about.value = true;
            }
            ImGui.EndMenu();
        }

        systemTimeLastUpdate += ImGui.GetIO().DeltaTime;
        if((systemTimeLastUpdate > 4) || (systemTime.length === 0)) // update on every 4 seconds
        {
            updateSystemTime();
            systemTimeLastUpdate = 0;
        }

        ImGui.SetCursorPosX(ImGui.GetWindowSize().x - (systemTimeTextWidth + 12) );  // 12 is right gap
        ImGui.PushID("systray_time");
        ImGui.Text(systemTime);
        ImGui.PopID();

        ImGui.EndMainMenuBar();
        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
    }
 
    if (show_system_editor.value)
    {
        const systemEditorDefaultWidth = 900;
        const systemEditorDefaultHeight = 550;           
        const systemEditorInitialWidth = (screenWidth > systemEditorDefaultWidth) ? systemEditorDefaultWidth : screenWidth;
        const systemEditorInitialHeight = (screenHeight > systemEditorDefaultHeight) ? systemEditorDefaultHeight : screenHeight;
        const systemEditorExplorerWidth = 200;

        ImGui.SetNextWindowSize(new ImGui.Vec2(systemEditorInitialWidth, systemEditorInitialHeight), ImGui.Cond.FirstUseEver);
        ImGui.SetNextWindowPos(new ImGui.Vec2((screenWidth - systemEditorInitialWidth) / 2, 
            (screenHeight - systemEditorInitialHeight) / 2), ImGui.Cond.FirstUseEver);

        let systemEditorTitle ="Live System Editor###System Editor";
        if(systemEditorOpenedFileName.length > 0)
        {
            systemEditorTitle = "Live System Editor - "+systemEditorOpenedFileName+"###System Editor";
        }
        
        if(ImGui.Begin(systemEditorTitle, show_system_editor.access, 
            ImGui.ImGuiWindowFlags.NoSavedSettings | ImGui.ImGuiWindowFlags.MenuBar))
        {
            if (ImGui.BeginMenuBar())
            {
                if (ImGui.BeginMenu("File"))
                {
                    if (ImGui.MenuItem("Save","",false, systemEditorOpenedFileName.length > 0))
                    {
                        saveBufferToFile("root/" + systemEditorOpenedFileName);  
                        updateIfApplication(systemEditorOpenedFileName);                    
                    }

                    ImGui.Separator();

                    if (ImGui.MenuItem("New File...","",false))
                    {
                        shouldShowNewFileInputBox = true;                                 
                    }

                    ImGui.Separator();

                    if (ImGui.MenuItem("Import File System...","",false))
                    {
                       importFileSystem();                        
                    }
                    
                    if (ImGui.MenuItem("Export File System...","",false))
                    {
                        exportFileSystem();                           
                    }                    

                    ImGui.EndMenu();
                }

                if (ImGui.BeginMenu("Edit"))
                {
                    if (ImGui.MenuItem("Delete File...","",false, systemEditorOpenedFileName.length > 0))
                    {
                        shouldShowDeleteFilePopUp = true;                
                    }

                    ImGui.EndMenu();
                }

                ImGui.EndMenuBar();
            }          

            ImGui.BeginTable("Explorer", 1, ImGui.ImGuiTableFlags.ScrollX | ImGui.ImGuiTableFlags.ScrollY | 
                ImGui.ImGuiTableFlags.BordersV | ImGui.ImGuiTableFlags.BordersOuterH | 
                ImGui.ImGuiTableFlags.NoBordersInBody, new ImGui.Vec2(systemEditorExplorerWidth, -FLT_MIN));
            ImGui.TableSetupColumn("Explorer", ImGui.TableColumnFlags.NoHide );
            ImGui.TableHeadersRow();

            if(rootDirData !== undefined)
            {
                for(let file of rootDirData.files) 
                {
                    ImGui.TableNextRow();   
                    ImGui.TableNextColumn();    
                    let flags =  ImGui.TreeNodeFlags.Leaf | ImGui.TreeNodeFlags.Bullet | ImGui.TreeNodeFlags.NoTreePushOnOpen | ImGui.TreeNodeFlags.SpanFullWidth;

                    if(systemEditorOpenedFileName === file.name)
                        flags |= ImGui.TreeNodeFlags.Selected;
                    
                    ImGui.TreeNodeEx(file.name,  flags);

                    if (ImGui.IsItemClicked())
                    {
                        if(systemEditorOpenedFileName !== file.name){
                            systemEditorShouldOpenFile = true;
                        }
                        
                        systemEditorOpenedFileName = file.name;
                    }
                }
            }

            ImGui.EndTable();            

            ImGui.SameLine();    
            
            if(systemEditorShouldOpenFile)
            {                 
                readFileContentToBuffer("root/" + systemEditorOpenedFileName);
                systemEditorShouldOpenFile = false;
            }

            ImGui.InputTextMultiline("##source", systemEditorTextBuffer, MAX_TEXT_FILE_SIZE, 
                new ImGui.Vec2(-FLT_MIN, -FLT_MIN), ImGui.InputTextFlags.AllowTabInput);                          

            if (shouldShowNewFileInputBox)
            {
                systemEditorNewFileNameBuffer =  new ImGui.StringBuffer(MAX_FILE_NAME_LENGTH, "");
                ImGui.OpenPopup("New File...");
                shouldShowNewFileInputBox = false;
                shouldCloseNewFileInputPopUp = false;
            }else if(shouldShowDeleteFilePopUp)
            {
                ImGui.OpenPopup("Delete File...");
                shouldShowDeleteFilePopUp = false;
            }
    
            const center = ImGui.GetMainViewport().GetCenter();

            makeNextWindowCenter();        
            if (ImGui.BeginPopupModal("New File...", null, ImGui.WindowFlags.AlwaysAutoResize))
            {
                ImGui.Text("Enter file name:");
                ImGui.InputText(" ###input_456464654565", systemEditorNewFileNameBuffer, ImGui.ARRAYSIZE(systemEditorNewFileNameBuffer));
            
                ImGui.Separator();
    
                if (ImGui.Button("OK", new ImGui.Vec2(120, 0))) { 
                    let fileName = systemEditorNewFileNameBuffer.buffer.trim();
                    if(fileName.length !== 0)
                    {
                        let filePath = "root/" + fileName;
                        fileSystem.exists(filePath).then(function(results)
                        {
                            if(!results)
                            {
                                fileSystem.writeFile(filePath, "").then(function(){
                                    readFileSystem();
                                });
                                shouldCloseNewFileInputPopUp = true;                              
                            }
                        });  
                    }       
                }

                if(shouldCloseNewFileInputPopUp)
                    ImGui.CloseCurrentPopup(); 

                ImGui.SetItemDefaultFocus();
                ImGui.SameLine();
                if (ImGui.Button("Cancel", new ImGui.Vec2(120, 0))) { ImGui.CloseCurrentPopup(); }
                ImGui.EndPopup();
            }     
            
            makeNextWindowCenter();
            if (ImGui.BeginPopupModal("Delete File...", null, ImGui.WindowFlags.AlwaysAutoResize))
            {
                ImGui.Text("Are you sure you want to delete the selected file?");     
                ImGui.Separator();
    
                if (ImGui.Button("Yes", new ImGui.Vec2(120, 0))) {                   
                    ImGui.CloseCurrentPopup(); 
                    fileSystem.removeFile("root/" + systemEditorOpenedFileName).then(function (){
                        readFileSystem();
                        systemEditorTextBuffer = new ImGui.StringBuffer(MAX_TEXT_FILE_SIZE, "");
                        systemEditorOpenedFileName = "";
                    });
                }

                ImGui.SetItemDefaultFocus();
                ImGui.SameLine();
                if (ImGui.Button("No", new ImGui.Vec2(120, 0))) { ImGui.CloseCurrentPopup(); }
                ImGui.EndPopup();
            }  

        }
        ImGui.End();

    }

    if(show_system_about.value)
    {
        makeNextWindowCenter();
        if (ImGui.Begin("About ZyncOS", show_system_about.access, ImGui.WindowFlags.AlwaysAutoResize))
        {
            ImGui.Text('ZyncOS v1.0');
            ImGui.Separator();
            ImGui.Text("By R.Hasaranga (c) 2023.");
            ImGui.Text("Created with imgui-js and indexeddb-fs.");          
            ImGui.Text("ZyncOS is licensed under the MIT License.");
            ImGui.Separator();
            ImGui.Text("Visit https://github.com/hasaranga/ZyncOS for more information.");
        }
        ImGui.End();
    }

    if(show_system_logs.value)
    {
        ImGui.SetNextWindowSize(new ImGui.Vec2(U2P(500), U2P(300)), ImGui.Cond.FirstUseEver);
        makeNextWindowCenter();
        if (ImGui.Begin("System Logs", show_system_logs.access, ImGui.ImGuiWindowFlags.NoSavedSettings))
        {
            for (let i = 0; i < systemLog.Size; i++)
            {
                const item: string = systemLog[i];
                ImGui.TextUnformatted(item);
            }         
        }
        ImGui.End();        
    }

    runApplications();
}


