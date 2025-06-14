import {useEffect, useRef, useState} from 'react';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

const SAVE_INTERVAL_MS = 1000
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          
  [{ 'font': [] }],
  [{ 'align': [] }]         
];

export default function Docs() {
    const { id, room } = useParams()
    console.log(room);
    const wrapperRef = useRef(null);
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()

    useEffect(() => {
      const s = io("http://13.204.80.70", {
        path: "/api/socket.io",
        withCredentials: true
      });
      s.on("connect",() => {
        console.log("doc connected.");
      });
      setSocket(s)
      return () => {
        s.disconnect()
      }
    }, [])

     useEffect(() => {
      if(socket == null || quill == null) return

      socket.once("load-document", document => {
        quill.setContents(document)
        quill.enable()
      })

      socket.emit('get-document', room)
    }, [socket, quill, room])

    useEffect(() => {
      if(socket == null || quill == null)return

      const interval = setInterval(() => {
        socket.emit('save-document', quill.getContents())
      }, SAVE_INTERVAL_MS)

      return () => {
        clearInterval(interval)
      }
    }, [socket, quill])

    useEffect(() => {
      if(socket == null || quill == null) return

      const handler = (delta) => {
        quill.updateContents(delta)
      } 
      socket.on("receive-changes", handler)

      return () => {
        socket.off("receive-changes", handler)
      }
    }, [socket, quill])


    useEffect(() => {
      if(socket == null || quill == null) return

      const handler = (delta, oldDelta, source) => {
        if(source !== "user") return
        socket.emit("send-changes", delta)
      } 
      quill.on("text-change", handler)

      return () => {
        quill.off("text-change", handler)
      }
    }, [socket, quill])

    useEffect(() => {
        const editor = document.createElement("div");
        const wrapperDiv = wrapperRef.current;
        wrapperDiv.append(editor);
        const q = new Quill(editor, {theme: "snow",
          modules: { toolbar: toolbarOptions }
        })
        q.disable()
        q.setText('Loading...')
        setQuill(q);

        return () => {
            wrapperDiv.innerHTML = "";  
        };
    }, []);

  return (
    <Box ref={wrapperRef}></Box>
  )
}





