import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

export default function Home() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [userName, setUserName] = useState("");

  function handleEnterInput(e) {
    if (e.code === "Enter") {
      joinRoom();
    }
    console.log(e.code);
  }

  useEffect(() => {
    function handleEnter() {
      document.addEventListener("keyup", handleEnterInput);
    }

    handleEnter();

    return () => document.removeEventListener("keyup", handleEnterInput);
  });

  function generateRoomId(e) {
    e.preventDefault();
    const id1 = uuidV4();
    setId(id1);
    toast.success("Created a new room");
  }

  function joinRoom() {
    if (!id || !userName) {
      toast.error("Please Enter Name and Room Id !");
      return;
    }
    navigate(`/editor/${id}`, {
      state: {
        username: userName,
      },
    });
  }

  return (
    <div className="homePageWrapper">
      <div className="formwrapper">
        <img
          className="homePageLogo"
          src="/code-sync.png"
          alt="code-sync-logo"
        />
        <h4 className="mainLabel">Paste Invitation Room Id</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID:"
            required
            value={id}
            onChange={(e) => setId(e.target.value)}
          ></input>
          <input
            required
            type="text"
            className="inputBox"
            placeholder="USERNAME:"
            onChange={(e) => setUserName(e.target.value)}
          ></input>
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            If You Don't have an Invite then create{" "}
            <a href="/" className="createnewBtn" onClick={generateRoomId}>
              new Room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built with 💖 by <a href="">Yashraj</a>
        </h4>
      </footer>
    </div>
  );
}
