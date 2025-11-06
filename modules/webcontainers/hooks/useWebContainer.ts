import { useState, useEffect, useCallback, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import { TemplateFolder } from '@/modules/playground/libs/path-to-json';

interface UseWebContainerProps {
   templateData?: TemplateFolder | null;
}

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
  isBooting: boolean; 
}

// CRITICAL FIX: Global singleton instance to prevent multiple boots
let globalWebContainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let bootingInProgress = false;

export const useWebContainer = ({ templateData }: UseWebContainerProps): UseWebContainerReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple mounts from same component
    if (mountedRef.current) return;
    mountedRef.current = true;

    let mounted = true;

    async function initializeWebContainer() {
      try {
        console.log('Initializing WebContainer...');
        setIsBooting(true);
        
        // CASE 1: Already booted - reuse existing instance
        if (globalWebContainerInstance) {
          console.log('Reusing existing WebContainer instance');
          if (mounted) {
            setInstance(globalWebContainerInstance);
            setIsBooting(false);
            setIsLoading(false);
          }
          return;
        }

        // CASE 2: Currently booting - wait for existing boot promise
        if (bootingInProgress && bootPromise) {
          console.log('WebContainer boot already in progress, waiting...');
          const webcontainerInstance = await bootPromise;
          if (mounted) {
            setInstance(webcontainerInstance);
            setIsBooting(false);
            setIsLoading(false);
          }
          return;
        }

        // CASE 3: First boot - create new instance
        console.log('Booting new WebContainer instance...');
        bootingInProgress = true;
        bootPromise = WebContainer.boot();
        
        const webcontainerInstance = await bootPromise;
        
        if (!mounted) {
          bootingInProgress = false;
          return;
        }
        
        console.log('WebContainer booted successfully!');
        globalWebContainerInstance = webcontainerInstance;
        setInstance(webcontainerInstance);
        setIsBooting(false);
        setIsLoading(false);
        bootingInProgress = false;
        
      } catch (err) {
        console.error('Failed to initialize WebContainer:', err);
        bootingInProgress = false;
        bootPromise = null; // Reset on error so retry is possible
        
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer');
          setIsLoading(false);
          setIsBooting(false);
        }
      }
    }

    initializeWebContainer();

    return () => {
      mounted = false;
      // DON'T teardown on unmount - keep singleton alive
      // Only teardown when explicitly called via destroy()
    };
  }, []); // Empty deps - only run once

  const writeFileSync = useCallback(async (path: string, content: string): Promise<void> => {
    if (!instance) {
      throw new Error('WebContainer instance is not available');
    }

    try {
      // Ensure the folder structure exists
      const pathParts = path.split('/');
      const folderPath = pathParts.slice(0, -1).join('/'); // Extract folder path

      if (folderPath) {
        await instance.fs.mkdir(folderPath, { recursive: true }); // Create folder structure recursively
      }

      // Write the file
      await instance.fs.writeFile(path, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to write file';
      console.error(`Failed to write file at ${path}:`, err);
      throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
    }
  }, [instance]);

  // Modified destroy function - tears down global instance
  const destroy = useCallback(() => {
    console.log('Destroying WebContainer instance...');
    if (globalWebContainerInstance) {
      globalWebContainerInstance.teardown();
      globalWebContainerInstance = null;
      bootPromise = null;
      bootingInProgress = false;
    }
    setInstance(null);
    setServerUrl(null);
    setIsBooting(false);
    setIsLoading(true);
  }, []);

  return { serverUrl, isLoading, error, instance, writeFileSync, destroy, isBooting };
};