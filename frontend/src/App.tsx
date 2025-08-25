import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/health").then(res => setMsg(res.data));
  }, []);

  return <h1 className="text-2xl text-red-600">{msg}</h1>;
}

export default App;
