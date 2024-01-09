import { useCallback, useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { xml } from "@codemirror/lang-xml";
import { java } from "@codemirror/lang-java";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import toast from "react-hot-toast";
import { throttle } from "lodash";
import ACTIONS from "../Actions";
export default function Editor({ socketRef, roomId, onCodeChange }) {
  const [isLocked, setIsLocked] = useState({ lock: false, mount: 0 });
  const [value, setValue] = useState("");

  if (socketRef.current) {
    socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      if (code !== null) {
        setValue(code);
        onCodeChange(code);
      }
    });
  }

  const onChange = useCallback(
    throttle((val, viewUpdate) => {
      setValue(val);
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: val,
      });
    }, 1000),
    []
  );

  useEffect(() => {
    function checkIfCode(e) {
      if (
        ((e.keyCode >= 65 && e.keyCode <= 91) ||
          (e.keyCode >= 48 && e.keyCode <= 57) ||
          (e.keyCode >= 97 && e.keyCode <= 122)) &&
        isLocked.lock
      ) {
        toast.error("Editor is locked !");
      }
    }

    function check() {
      document.addEventListener("keyup", checkIfCode);
    }
    check();
    return () => document.removeEventListener("keyup", checkIfCode);
  }, [isLocked.lock]);

  useEffect(() => {
    let val;
    if (socketRef.current) {
      val = socketRef;
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          onCodeChange(code);
          setValue(code);
        }
      });
    }

    return () => {
      if (val) {
        val.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [value, socketRef, onCodeChange]);

  useEffect(() => {
    if (!isLocked.lock && isLocked.mount > 0) {
      toast.success("Editor is Unlocked !");
    }
  }, [isLocked]);

  return (
    <>
      <button
        className="btn lockBtn"
        onClick={() => {
          setIsLocked((prevState) => ({
            lock: !prevState.lock,
            mount: prevState.mount + 1,
          }));
          toast.dismiss();
        }}
      >
        {isLocked.lock ? " Unlock" : "Lock"}
      </button>
      <CodeMirror
        style={{ fontSize: "1rem" }}
        autoFocus
        value={value}
        className="code-mirror"
        height="100vh"
        theme={okaidia}
        extensions={([javascript({ jsx: true })], [xml()], [java()])}
        onChange={onChange}
        readOnly={isLocked.lock}
      />
    </>
  );
}
