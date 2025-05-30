    import ChatWindow from "./components/ChatWindow";

    function app() 
    {
        return (
            <div classame="flex justify-center items-center h-screen bg-gray-100">
                <div classname="w-full max-w-2x1 bg-white shadow-x1 rounded-lg p-4">
                    <h1 classname="text-x1 font-bold text center mb-4 text-blue-600">TaurusBot</h1>
                    <ChatWindow />
                </div>
            </div>
        )
    }

    export default App;
