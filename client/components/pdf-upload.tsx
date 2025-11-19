"use client";

import { File, Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Spinner } from "./ui/spinner";
import { API_URL, cn } from "@/lib/utils";
import { addFile, getFiles, setCurrentFileName } from "@/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

export default function PdfUpload({ selectedFileName }: { selectedFileName?: string }) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [allFiles, setAllFiles] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleGetFiles = React.useCallback(() => {
    const files = getFiles();
    setAllFiles(files);
  }, []);

  React.useEffect(() => {
    handleGetFiles();
  }, [handleGetFiles]);

  const onFileValidate = React.useCallback((file: File): string | null => {
    // Validate file type (only PDF)
    if (!file.type.startsWith("application/pdf")) {
      return "Only PDF files are allowed";
    }

    // Validate file size (max 2MB)
    const MAX_SIZE = 20 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
    }

    return null;
  }, []);

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const handleUpload = async () => {
    if (!files[0]) {
      toast.error("Please select a PDF file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", files[0]);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Upload failed");
        return;
      }

      const data = await response.json();
      toast.success(data.message || "File uploaded successfully");

      // Save file to localStorage
      addFile(data.fileName);
      setCurrentFileName(data.fileName);
      handleGetFiles();

      setFiles([]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <File />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto min-w-2xl">
        <DialogHeader>
          <DialogTitle>Select a file</DialogTitle>
          <DialogDescription>Select a PDF file to chat with</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          {allFiles.map((file) => (
            <div
              key={file}
              className={cn(
                "flex items-center gap-2 border-t last:border-b p-2 hover:bg-accent/30 cursor-pointer",
                selectedFileName === file && "bg-accent/30"
              )}
              onClick={() => {
                setCurrentFileName(file);
                setDialogOpen(false);
              }}
            >
              <File />
              <p>{file.split("_").slice(1).join(" ")}</p>
            </div>
          ))}
        </div>
        <FileUpload
          value={files}
          onValueChange={setFiles}
          onFileValidate={onFileValidate}
          onFileReject={onFileReject}
          accept="application/pdf"
          className="w-full"
        >
          {!files.length && (
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">Drag & drop PDF file here</p>
                <p className="text-muted-foreground text-xs">Or click to browse (only PDF files are allowed)</p>
              </div>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-fit">
                  Browse PDF file
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
          )}
          <FileUploadList>
            {files.map((file) => (
              <FileUploadItem key={file.name} value={file}>
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <X />
                  </Button>
                </FileUploadItemDelete>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <Button onClick={handleUpload}>
                  {uploading ? <Spinner /> : <Upload />}
                  {!uploading && "Upload"}
                </Button>
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>
      </DialogContent>
    </Dialog>
  );
}
