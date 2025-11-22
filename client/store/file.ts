import { CURRENT_FILE_KEY, FILES_KEY } from "@/lib/storage-keys";
import { create } from "zustand";

interface FileStore {
  files: string[];
  currentFile: string | null;
  setFiles: (files: string[]) => void;
  setCurrentFile: (file: string | null) => void;
}

const isBrowser = () => typeof window !== 'undefined';

const useFileStore = create<FileStore>((set) => ({
  files: isBrowser() ? JSON.parse(localStorage.getItem(FILES_KEY) || "[]") : [],
  currentFile: isBrowser() ? localStorage.getItem(CURRENT_FILE_KEY) || null : null,
  setFiles: (files: string[]) => {
    set({ files })
    if (isBrowser()) {
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }
  },
  setCurrentFile: (file: string | null) => {
    set({ currentFile: file })
    if (isBrowser()) {
      if (file) {
        localStorage.setItem(CURRENT_FILE_KEY, file);
      } else {
        localStorage.removeItem(CURRENT_FILE_KEY);
      }
    }
  },
}));

export default useFileStore;