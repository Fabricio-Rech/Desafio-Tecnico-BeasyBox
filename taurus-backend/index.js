const express = require("express");
const cors = require("cors");
const app = express();
const chatRoutes = require("./routes/chat");

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes); 


const PORT = 3001;
app.listen(PORT, () => {console.log(`Servidor rodando na porta ${PORT}`);});
