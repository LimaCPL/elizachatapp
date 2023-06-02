import { useState } from "react";
import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-web";
import { ElizaService } from "./gen/buf/connect/demo/eliza/v1/eliza_connect";
import { IntroduceRequest } from "./gen/buf/connect/demo/eliza/v1/eliza_pb";
import "./App.css";
interface Response {
  text: string;
  sender: "eliza" | "user";
}

function App() {
  const [statement, setStatement] = useState<string>("");
  const [introFinished, setIntroFinished] = useState<boolean>(false);
  const [messages, setMessages] = useState<Response[]>([
    {
      text: "What is your name",
      sender: "eliza",
    },
  ]);



  const transport = createConnectTransport({
    baseUrl: "https://demo.connect.build",
  });
  const client = createPromiseClient(
    ElizaService,
    transport
  );

  const send = async (sentence: string) => {
    setMessages((resp) => [
      ...resp,
      {
        text: sentence,
        sender: "user",
      },
    ]);

    setStatement("");

    if (introFinished) {
      const response = await client.say({
        sentence,
      });

      setMessages((resp) => [
        ...resp,
        {
          text: response.sentence,
          sender: "eliza",
        },
      ]);
    } else {
      const request = new IntroduceRequest({
        name: sentence,
      });

      for await (const response of client.introduce(request)) {
        setMessages((resp) => [
          ...resp,
          {
            text: response.sentence,
            sender: "eliza",
          },
        ]);
      }
      setIntroFinished(true);
    }
  };

  const handleStatementChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStatement(event.target.value);
  };

  const handleSend = () => {
    send(statement);
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div>
      <h3 style={{ textAlign: "center", backgroundColor:"#f28964", color:"#fff", padding:"20px",marginTop:"0"  }}>Start Chatting With Eliza... </h3>
      <div className="container">
        {messages.map((msg) => {
          return (
            <div
              key={`resp${1}`}
              className={
                msg.sender === "eliza"
                  ? "eliza-resp-container"
                  : "user-resp-container"
              }
            >
              {msg.sender === "eliza" ? (
                <p className="resp-text">
                  <span style={{ margin: "0 .2rem" }}>Eliza:</span>
                  {msg.text}
                </p>
              ) : (
                <p className="resp-text">
                  <span style={{ margin: "0 .2rem" }}>User:</span>
                  {msg.text}
                </p>
              )}
            </div>
          );
        })}

        <div className="input-container">
          <input
            type="text"
            value={statement}
            className="text-input"
            onChange={handleStatementChange}
            onKeyDown={handleKeyPress}
          />

          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
