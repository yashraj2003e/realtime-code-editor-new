import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Client from "../Components/Client";
import Editor from "../Components/Editor";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";

export default function EditorPage() {
  const [clients, setClients] = useState([]);
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("Socket error", e);
        toast.error("Socket Connection failed, try again later !");
        reactNavigator("/");
      }
      console.log(id, location.state.username);
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId: id,
        username: location.state?.username,
      });

      //Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state.username) {
            setClients({ socketId: socketId, username: username });
            toast.success(`${username} has joined the room !`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId: socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} has left the room !`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  function leaveRoom() {
    reactNavigator("/");
  }

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Room Id Copied !");
    } catch (err) {
      toast.error("Could not copy Room Id !");
    }
  }

  if (!location.state) {
    console.log(1);
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client username={client.username} key={client.sockedId} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={id}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />{" "}
      </div>
    </div>
  );
}
