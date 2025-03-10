import React, { useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { FileOpener } from "@capawesome-team/capacitor-file-opener";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";

const FILE_NAME = "sample.txt";
const FILE_MIME_TYPE = "text/plain";

const App: React.FC = () => {
  StatusBar.setOverlaysWebView({ overlay: false });
  useEffect(() => {
    // Request notification permissions
    LocalNotifications.requestPermissions();

    // Register notification listener
    LocalNotifications.addListener(
      "localNotificationActionPerformed",
      async (event) => {
        if (event.notification.id === 1) {
          openFile();
        }
      }
    );

    return () => {
      // Clean up listeners
      LocalNotifications.removeAllListeners();
    };
  }, []);

  const downloadFile = async (): Promise<void> => {
    try {
      // Create a simple text blob
      const blob = new Blob(["This is a sample text file."], {
        type: FILE_MIME_TYPE,
      });

      // Convert blob to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const base64 = reader.result.toString().split(",")[1];
            resolve(base64);
          } else {
            reject(new Error("Failed to convert blob to base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Define file path based on platform
      const filePath =
        Capacitor.getPlatform() === "ios" ? FILE_NAME : `Download/${FILE_NAME}`;

      // Save file
      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      // Show notification
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: "Download Complete",
            body: "Tap to open the file",
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const openFile = async (): Promise<void> => {
    try {
      const filePath =
        Capacitor.getPlatform() === "ios" ? FILE_NAME : `Download/${FILE_NAME}`;

      // Get full path
      const fileInfo = await Filesystem.getUri({
        directory: Directory.Documents,
        path: filePath,
      });

      // Open file
      await FileOpener.openFile({
        path: fileInfo.uri,
        mimeType: FILE_MIME_TYPE,
      });
    } catch (error) {
      console.error("Failed to open file", error);
    }
  };

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
      {/* Fixed Lorem Ipsum section with direct text */}
      <div style={{ padding: "1px", backgroundColor: "white" }}>
        <h2 style={{ color: "black" }}>Lorem Ipsum</h2>
        <div
          style={{
            color: "black",
            marginBottom: "20px",
            lineHeight: "1.5",
          }}
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
            diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac
            quam viverra nec consectetur ante hendrerit. Donec et mollis dolor.
            Praesent et diam eget libero egestas mattis sit amet vitae augue.
          </p>
          <p>
            Nam tincidunt congue enim, ut porta lorem lacinia consectetur. Donec
            ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Aenean ut gravida
            lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor.
          </p>
          <p>
            Pellentesque auctor nisi id magna consequat sagittis. Curabitur
            dapibus enim sit amet elit pharetra tincidunt feugiat nisl
            imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed
            odio eros.
          </p>
        </div>
      </div>

      {/* Download button with clear styling */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px",
          backgroundColor: "white",
        }}
      >
        <button
          onClick={downloadFile}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Download File
        </button>
      </div>
    </div>
  );
};

export default App;
