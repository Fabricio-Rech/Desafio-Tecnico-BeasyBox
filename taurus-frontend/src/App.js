import React from "react";
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-screen-lg bg-white shadow-xl rounded-lg p-4">
        <h1 className="text-2xl font-bold text-center mb-4 text-blue-800">TaurusBot</h1>
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;

