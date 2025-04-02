import { useEffect, useState } from 'react';
import { FolderTree, Code, Eye, ChevronRight, ChevronDown, File } from 'lucide-react';
import axios from 'axios';
import { conf } from '../config/index'
import { initParseFileStructure } from '../utils/initParser';
import { reactInitPrompt, reactInitSteps } from '../defaults/react';
import { nodeInitPromots } from '../defaults/node';
import { FileType } from '../types';
import { parseDeepArtifact } from '../utils/Parser';
import { useWebContainer } from '../hooks/useWebcontainer';
import { FileSystemTree } from '@webcontainer/api';

interface PreviewPageProps {
  prompt: string;
}

export function PreviewPage({ prompt }: PreviewPageProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['src']);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [fileStructure, setFileStructure] = useState<FileType[] | []>([]);
  const [fileSteps, setFileSteps] = useState<string[]|[]>([]);
  const webContainerInstance = useWebContainer();
  const [url, setUrl] = useState("");

  const main = async() => {
    const res = await axios.post(`${conf.Backend_url}/init`, {
      prompt
    })

    console.log(res)
    
    if (res.data.message==='react') {
      const parsedRes = initParseFileStructure(reactInitPrompt);
      setFileStructure(parsedRes);
      setFileSteps(reactInitSteps)

      const chatRes = await axios.post(`${conf.Backend_url}/chat`, {
        prompt,
        initStack: res.data.message
      })

      console.log(chatRes);

      const findFileAndReplaceContent = (filePath: string[], currFolder: FileType[], content: string, idx: number, path: string) => {
        const CurrDirIdx = currFolder.findIndex(File => File.name===filePath[idx]);
        path += filePath[idx];
        if (CurrDirIdx!==-1) {
          if (currFolder[CurrDirIdx].type==='file') {
            currFolder[CurrDirIdx].content = content;
            return;
          } else {
            findFileAndReplaceContent(filePath, currFolder[CurrDirIdx].children!, content, idx+1, path);
          }
        } else {
          if (idx === filePath.length-1) {
            currFolder.push({
              type: 'file',
              content,
              name: filePath[idx],
              children: [],
              path
            })
          } else {
            currFolder.push({
              type: 'folder',
              name: filePath[idx],
              children: [],
              path
            })
            findFileAndReplaceContent(filePath, currFolder[currFolder.length-1].children!, content, idx+1, path);
          }
        }
      }

      const parsedDeepArtifactRes = parseDeepArtifact(chatRes.data);
      const tempFileStructure = [...parsedRes];
      parsedDeepArtifactRes?.files.map(file => {
        const idx = 0;
        const filePath = file.filePath.split('/');
        const path = file.filePath[idx];
        const content = file.content;
        const CurrDirIdx = tempFileStructure.findIndex(File => File.name===filePath[idx]);
        if (CurrDirIdx!==-1) {
          if (tempFileStructure[CurrDirIdx].type==='file') {
            tempFileStructure[CurrDirIdx].content = content;
            return;
          } else {
            findFileAndReplaceContent(filePath, tempFileStructure[CurrDirIdx].children!, content, idx+1, path);
          }
        } else {
          if (idx === filePath.length-1) {
            tempFileStructure.push({
              type: 'file',
              content,
              name: filePath[idx],
              children: [],
              path
            })
          } else {
            tempFileStructure.push({
              type: 'folder',
              name: filePath[idx],
              children: [],
              path
            })
            findFileAndReplaceContent(filePath, tempFileStructure[tempFileStructure.length-1].children!, content, idx+1, path);
          }
        }
      })
      setFileStructure(tempFileStructure);
    } else if (res.data.message==='node') {
      initParseFileStructure(nodeInitPromots);
    }
  }

  useEffect(() => {
    main();
  }, [])
  
  const mountWebcontainer = async (Folder: FileType[]) => {
    const res: FileSystemTree = {};
    for (const File of Folder) {
      if (File.type === 'file') {
        res[File.name] = {
          file: {
            contents: File.content as string
          }
        };
      } else {
        res[File.name] = {
          directory: await mountWebcontainer(File.children)
        };
      }
    }
    await webContainerInstance?.mount(res);

    return res;
  };

  useEffect(() => {
    const main = async() => {
      await mountWebcontainer(fileStructure)
    }
    main();
  }, [fileStructure])

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev =>
      prev.includes(folderName)
        ? prev.filter(name => name !== folderName)
        : [...prev, folderName]
    );
  };

  const handleFileClick = (file: FileType) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      setActiveTab('code');
    }
  };

  const renderFileTree = (items: FileType[], level = 0) => {
    return items.map((item, index) => (
      <div key={index} style={{ marginLeft: `${level * 12}px` }}>
        <div
          className={`flex items-center gap-2 p-1 rounded hover:bg-gray-700 cursor-pointer text-gray-300 hover:text-white`}
          onClick={() => item.type === 'folder' ? toggleFolder(item.name) : handleFileClick(item)}
        >
          {item.type === 'folder' ? (
            <>
              {expandedFolders.includes(item.name) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <FolderTree className="h-4 w-4 text-yellow-400" />
            </>
          ) : (
            <>
              <File className="h-4 w-4 text-blue-400" />
            </>
          )}
          <span className="text-sm">{item.name}</span>
        </div>
        {item.type === 'folder' && expandedFolders.includes(item.name) && item.children && (
          <div className="mt-1">
            {renderFileTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const preview = async() => {
    const installProcess = await webContainerInstance?.spawn('npm', ['install']);
  
    const installExitCode = await installProcess?.exit;
  
    if (installExitCode !== 0) {
      throw new Error('Unable to run npm install');
    }
  
    await webContainerInstance?.spawn('npm', ['run', 'dev']);

    webContainerInstance?.on('server-ready', (port, url) => {
      setUrl(url)
    });
  }

  return (
    <div className="flex h-screen">
      <div className="w-96 border-r border-gray-700 bg-gray-800 p-4 overflow-y-auto h-full">
        <h2 className="font-semibold mb-4 text-white">Build Steps</h2>
        <div className="space-y-2">
          {fileSteps.map((step, index) => (
            <div
              key={index}
              className="p-2 rounded bg-gray-700 text-sm flex items-center gap-2 text-gray-200"
            >
              <div className="w-6 h-6 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs">
                {index + 1}
              </div>
              {step.split(':')[0]}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex h-screen w-full">
        <div className="w-64 border-r border-gray-700 bg-gray-800 p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <FolderTree className="h-4 w-4" />
            Files
          </h2>
          <div className="space-y-1">
            {renderFileTree(fileStructure)}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-900 w-[100vw-40rem] h-screen">
          <div className="border-b border-gray-700 px-4 py-2 flex gap-4">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                activeTab === 'code' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="h-4 w-4" />
              Code
            </button>
            <button
              onClick={() => {
                setActiveTab('preview');
                preview();
              }}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                activeTab === 'preview' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          </div>
          <div className="flex-1 p-4">
            {activeTab === 'code' ? (
              <pre className="bg-gray-800 p-4 rounded-lg shadow text-sm overflow-auto h-full text-gray-300">
                {selectedFile ? selectedFile.content : 'Select a file to view its contents'}
              </pre>
            ) : ( !url ? (
              <div className="bg-gray-800 p-4 rounded-lg shadow h-full text-white">
                  <h1 className="text-2xl font-bold">Preview</h1>
                  <p className="text-gray-300">Preview content will be shown here</p>
                </div>
              ) : (
                <iframe src={url} height={"100%"} width={"100%"}></iframe>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}