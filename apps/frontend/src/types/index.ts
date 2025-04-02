export interface FileType {
    name: string;
    type: 'file' | 'folder';
    content?: string;
    children: FileType[] | [];
    path: string
}