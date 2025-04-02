import { useEffect, useState } from "react"
import { WebContainer } from '@webcontainer/api';

export const useWebContainer = () => {
    const [webContainerInstance, setWebContainerInstance] = useState<WebContainer|null>(null);

    const main = async() => {
        const webcontainerInstance = await WebContainer.boot();
        setWebContainerInstance(webcontainerInstance);
    }
    useEffect(() => {
        main()
    }, [])

    return webContainerInstance;
}