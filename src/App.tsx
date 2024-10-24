import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RiMicLine } from "react-icons/ri";

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startRecognition = () => {
    let recognition = null;
    recognition = new ((window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript.trim());
      sendTranscript(currentTranscript.trim());
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
    };

    recognition.start();
  };

  const startRecording = () => {
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        if (result.state === "granted") {
          startRecognition();
        } else if (result.state === "prompt") {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => {
              startRecognition();
            })
            .catch((err) => {
              console.error("Microphone permission denied: ", err);
              toast.error("Microphone permission denied: ", err);
            });
        } else if (result.state === "denied") {
          toast.error(
            "Microphone access is blocked. Please allow it from settings."
          );
        }
      });
  };

  useEffect(() => {
    startRecording();
  }, []);

  const sendTranscript = (text: string) => {
    const chrome = (window as any).chrome;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "insertTranscript",
        transcript: text,
      });
    });
    setTimeout(() => window.close(), 500); // Close popup after sending transcript
  };

  return (
    <div className="h-[180px] flex flex-col items-center justify-center w-[160px] text-white bg-[#121212]">
      <h1 className="text-xl font-semibold mb-2">Voice Input</h1>
      <div className="infiniteZoomInOut my-2 w-[60px] h-[60px] flex items-center justify-center bg-red-600 rounded-full">
        <RiMicLine className="w-10 h-10" />
      </div>
      {transcript ? (
        <div className="h-[40px] w-11/12 mx-auto border p-1 border-neutral-800 border-dashed mt-2 rounded-lg">
          <p className="line-clamp-2 !text-[11px] opacity-70">{transcript}</p>
        </div>
      ) : isListening ? (
        <p className="mt-2 text-xs opacity-70">Listening...</p>
      ) : (
        <p className="mt-2 text-xs opacity-70">Processing...</p>
      )}
    </div>
  );
}

