import { FileType } from "../types";

export function initParseFileStructure(input: string): FileType[] {
  const files: FileType[] = [];
  const lines = input.split("\n");
  let currentFile: FileType | null = null;
  let currentContent: string[] = [];
  let insideCodeBlock = false;

  for (const line of lines) {
    if (line.trim() === "```") {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }

    const fileMatch = line.match(/^([\w./-]+\.\w+):$/);

    if (fileMatch && !insideCodeBlock) {
      // Store the previous file before creating a new one
      if (currentFile && currentContent.length > 0) {
        currentFile.content = formatContent(currentContent);
        files.push(currentFile);
      }

      // Start a new file
      currentFile = {
        name: fileMatch[1],
        type: "file",
        children: [],
        path: fileMatch[1],
      };
      currentContent = [];
    } else {
      // Collect content for the current file
      if (currentFile) {
        currentContent.push(line); // Preserve original indentation
      }
    }
  }

  if (currentFile && currentContent.length > 0) {
    currentFile.content = formatContent(currentContent);
    files.push(currentFile);
  }

  return buildFolderStructure(files);
}

// Function to normalize indentation while preserving formatting
function formatContent(lines: string[]): string {
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  const minIndent = nonEmptyLines.reduce((min, line) => {
    const match = line.match(/^\s*/);
    return match ? Math.min(min, match[0].length) : min;
  }, Number.MAX_SAFE_INTEGER);

  return lines.map(line => line.slice(minIndent)).join("\n");
}

function buildFolderStructure(files: FileType[]): FileType[] {
  const root: FileType[] = [];
  const folderMap: Record<string, FileType> = {};

  files.forEach(file => {
    const parts = file.name.split("/");
    let currentLevel = root;

    let path = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      path += parts[i];

      if (isFile) {
        file.name = part;
        file.path = path;
        currentLevel.push(file);
      } else {
        path += '/';
        let folder = folderMap[part];

        if (!folder) {
          folder = {
            name: part,
            type: "folder",
            children: [],
            path: part
          };
          folderMap[part] = folder;
          currentLevel.push(folder);
        }

        currentLevel = folder.children!;
      }
    }
  });

  return root;
}
