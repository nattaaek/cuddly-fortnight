import React, { useState } from "react";
import { useDropzone, DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("csvFile", file);

  const response = await fetch("http://localhost:8080/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }
};

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const onDrop = (acceptedFiles: File[]) => {
    setSelectedFile(acceptedFiles[0]);
  };

  const mutation = useMutation(uploadFile, {
    onSuccess: () => {
      queryClient.invalidateQueries(["files"]);
    },
  });

  const { getRootProps, getInputProps, isDragActive }: {
    getRootProps: () => DropzoneRootProps,
    getInputProps: () => DropzoneInputProps,
    isDragActive: boolean
  } = useDropzone({ onDrop });

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedFile) {
      mutation.mutate(selectedFile);
    }
  };

  return (
    <div>
    <div
        {...getRootProps()}
        className={`p-4 border-4 ${isDragActive ? "border-blue-500" : "border-gray-400"}`}
        >
        <input {...getInputProps()} />
        {selectedFile ? (
            <p>{selectedFile.name}</p>
        ) : (
            <p>{isDragActive ? "Drop the file here" : "Drag and drop a file here, or click to select a file"}</p>
        )}
        </div>
    <button onClick={handleFormSubmit} disabled={!selectedFile}>
        Upload
      </button>
    </div>

  );
};

export default FileUpload;
