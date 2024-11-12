"use client";
import {
  ChangeEventHandler,
  DragEventHandler,
  useEffect,
  useState,
} from "react";

const API_URL = "/api/compress";

const styles: Record<string, React.CSSProperties> = {
  maindiv: {
    minHeight: "100vh",
  },
  container: {
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "50px",
    minHeight: "20vh",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "20px",
  },
  uploadArea: {
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "inline-block",
    position: "relative",
    width: "300px",
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    display: "inline-block",
    cursor: "pointer",
    textDecoration: "none",
  },
  orText: {
    marginTop: "10px",
    color: "#666",
  },
  iconContainer: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  iconButton: {
    fontSize: "20px",
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
  },
  fileList: {
    marginTop: "20px",
    textAlign: "left",
    display: "inline-block",
  },
};

interface ApiCompressResponse {
  compressedSize: number;
  imageB64: string;
}

export default function Home() {
  const [file, setFile] = useState<{ file: File; url: string } | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [size, setSize] = useState<number>(0);
  const [state, setState] = useState<"idle" | "compressing" | "done" | "error">(
    "idle"
  );
  const isCompressing = state === "compressing";

  const handleFile = (file: File): void => {
    if (!file) {
      alert("No file selected");
    }

    setSize(file.size);
    setFile({ file, url: URL.createObjectURL(file) });
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = Array.from(event.target.files as any);
    handleFile(files[0] as File);
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    handleFile(files[0] as File);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  const handleCompress = () => {
    setState("compressing");

    const data = new FormData();
    data.append("file", file?.file as any);

    fetch(API_URL, {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((data: ApiCompressResponse) => {
        setCompressedImage(data.imageB64);
        setSize(data.compressedSize);
        setState("done");
      })
      .catch(() => {
        alert("Unable to compress the image");
        setState("error");
      });
  };

  useEffect(() => () => {
    if (file) {
      URL.revokeObjectURL(file?.url);
    }
  });

  return (
    <div style={styles.maindiv}>
      <div style={styles.container}>
        <h1 style={styles.title}>Compress image</h1>

        <div
          style={styles.uploadArea}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <label htmlFor="file-upload" style={styles.uploadButton}>
            Select image
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <p style={styles.orText}>or drop image here</p>
        </div>
      </div>
      <div style={styles.images}>
        {file && (
          <div
            style={{
              width: "640px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginInline: "auto",
              position: "relative",
              minHeight: "128px",
              marginBlock: "32px",
              borderRadius: "8px",
              overflow: "hidden",
              color: "#fff",
            }}
          >
            <img
              src={compressedImage || file.url}
              alt=""
              style={{
                opacity: isCompressing ? 0.5 : 1,
                border: "2px dotted rgba(75,75,75 / 0.9)",
                width: "100%",
                transition: "opacity 500ms ease-out",
              }}
            />
            <span
              style={{
                backgroundColor: "rgba(0, 0, 0, 75%)",
                backdropFilter: "blur(45px)",
                padding: "12px",
                position: "absolute",
                right: "0px",
                top: "0px",
                fontFamily: "monospace",
                borderBottomLeftRadius: "6px",
              }}
            >
              {state === "error" ? (
                "Compression error"
              ) : (
                <>
                  {" "}
                  Image size:{" "}
                  {isCompressing
                    ? "Wait..."
                    : `${size.toLocaleString()} bytes (${
                        state === "idle" ? "Original" : "Compressed"
                      })`}
                </>
              )}
            </span>
            {state !== "done" && (
              <button
                disabled={state !== "idle"}
                onClick={handleCompress}
                type="button"
                style={{
                  width: "100%",
                  marginTop: "-48px",
                  height: "48px",
                  border: "none",
                  backdropFilter: "blur(45px)",
                  background: "rgba(0,0,0,0.65)",
                  textAlign: "center",
                  fontWeight: "bold",
                  cursor: isCompressing ? "wait" : "pointer",
                }}
              >
                {isCompressing ? "Compressing..." : "Compress"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
