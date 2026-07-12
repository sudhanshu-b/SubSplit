"use client";

import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  name:  string;
  image: string | null;
};

export default function AvatarUpload({ name, image }: Props) {
  const [preview, setPreview] = useState(image);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const initial = name.charAt(0).toUpperCase() || "U";

  function pickFile() {
    setError("");
    inputRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError("");
    setUploading(true);

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const { error: updateError } = await authClient.updateUser({ image: dataUrl });
    setUploading(false);

    if (updateError) {
      setError(updateError.message ?? "Failed to update photo.");
      return;
    }
    setPreview(dataUrl);
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={pickFile}
        disabled={uploading}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full flex-shrink-0
                   bg-zinc-200 dark:bg-zinc-800 overflow-hidden
                   text-lg font-bold text-zinc-700 dark:text-zinc-300
                   disabled:cursor-wait"
        title="Change profile photo"
      >
        {preview
          ? <img src={preview} alt="" className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
          : initial}

        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
          {uploading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
            </svg>
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {error && <p className="text-[11px] text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
