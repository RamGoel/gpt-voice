import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

    recognition.onresult = (event) => {
      const currentTranscript = event.results[0][0].transcript;
      setTranscript(currentTranscript.trim());
      sendTranscript(currentTranscript.trim());
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
    };

    recognition.start();
  };

  const startRecording = () => {
    navigator.permissions.query({ name: "microphone" }).then((result) => {
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "insertTranscript",
        transcript: text,
      });
    });
    setTimeout(() => window.close(), 500); // Close popup after sending transcript
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Voice Input</h1>
      <p className="mb-2">{isListening ? "Listening..." : "Processing..."}</p>
      <p className="italic">{transcript}</p>
    </div>
  );
}

