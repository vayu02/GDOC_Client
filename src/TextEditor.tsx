// import { FC, useEffect, useCallback, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import Quill from 'quill'
// import 'quill/dist/quill.snow.css'
// import { io, Socket } from 'socket.io-client'

// const TOOLBAR_OPTIONS = [
//   [{ header: [1, 2, 3, 4, 5, 6, false] }],
//   [{ font: [] }],
//   [{ list: 'ordered' }, { list: 'bullet' }],
//   ['bold', 'italic', 'underline'],
//   [{ color: [] }, { background: [] }],
//   [{ script: 'sub' }, { script: 'super' }],
//   [{ align: [] }],
//   ['image', 'blockquote', 'code-block'],
//   ['clean'],
// ]

// const INTERVAL = 2000

// const TextEditor: FC = () => {
//   const { id: documentId } = useParams()
//   const [socket, setSocket] = useState<Socket>()
//   const [quill, setQuill] = useState<Quill>()

//   useEffect(() => {
//     const so = io('https://gdoc-djmd.onrender.com')
//     setSocket(so)
//     return () => {
//       so.disconnect()
//     }
//   }, [])

//   useEffect(() => {
//     // console.log(documentId)
//     if (socket == null && quill == null) return
//     //once cleans up event once it listens to
//     socket?.once('load-document', (document) => {
//       quill.setContents(document)
//       quill.enable()
//     })
//     socket?.emit('get-document', documentId)
//   }, [socket, quill, documentId])

//   useEffect(() => {
//     if (socket == null || quill == null) return
//     const interval = setInterval(() => {
//       socket.emit('save-document', quill.updateContents())
//     }, INTERVAL)
//     return () => {
//       clearInterval(interval)
//     }
//   }, [socket, quill])

//   useEffect(() => {
//     if (socket == null || quill == null) return

//     const handler = (delta) => {
//       quill.updateContents(delta)
//     }
//     socket.on('receive-changes', handler)

//     return () => {
//       socket.off('receive-changes', handler)
//     }
//   }, [socket, quill])

//   useEffect(() => {
//     // send changes to socket
//     if (socket == null || quill == null) return
//     const handler ,  sourcg) => {
//       if (source !== 'user') return //make sure user made changes
//       socket?.emit('send-changes', delta)
//     }
//     quill.on('text-change', handler)
//     return () => {
//       quill.off('text-change', handler)
//     }
//   }, [quill, socket])

//   const quillRef = useCallback((wrapper: HTMLDivElement | null) => {
//     if (wrapper == null) return
//     wrapper.innerHTML = ''
//     const editor = document.createElement('div')
//     wrapper.append(editor)
//     const q = new Quill(editor, {
//       theme: 'snow',
//       modules: { toolbar: TOOLBAR_OPTIONS },
//     })
//     q.disable()
//     q.setText('Loading...')
//     setQuill(q)
//   }, [])
//   return <main className='container' ref={quillRef}></main>
// }

// export default TextEditor

import { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io, Socket } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['image', 'blockquote', 'code-block'],
  ['clean'],
]

export default function TextEditor() {
  const { id: documentId } = useParams<{ id: string }>() // Use useParams with TypeScript type definition.

  const [socket, setSocket] = useState<Socket | null>(null)
  const [quill, setQuill] = useState<Quill | null>(null)

  useEffect(() => {
    const s = io('https://gdoc-djmd.onrender.com')
    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  useEffect(() => {
    if (socket == null || quill == null) return

    socket.once('load-document', (document) => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit('get-document', documentId)
  }, [socket, quill, documentId])

  useEffect(() => {
    if (socket == null || quill == null) return

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta: any) => {
      quill.updateContents(delta)
    }
    socket.on('receive-changes', handler)

    return () => {
      socket.off('receive-changes', handler)
    }
  }, [socket, quill])

  useEffect(() => {
    if (socket == null || quill == null) return

    const handler = (delta: any, source: any) => {
      if (source !== 'user') return
      socket.emit('send-changes', delta)
    }
    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
    }
  }, [socket, quill])

  const wrapperRef = useCallback((wrapper: HTMLDivElement | null) => {
    if (wrapper == null) return

    wrapper.innerHTML = ''
    const editor = document.createElement('div')
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
    })
    q.disable()
    q.setText('Loading...')
    setQuill(q)
  }, [])

  return <div className='container' ref={wrapperRef}></div>
}
