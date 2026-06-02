import { Tldraw, createTLStore } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import { useState, useEffect } from 'react'
import { rtdb } from '../firebase/firebaseConfig'
import { ref, onValue, set } from 'firebase/database'

export default function SharedWhiteboard({ roomID }) {
  const [store] = useState(() => createTLStore())

  useEffect(() => {
    const boardRef = ref(rtdb, `whiteboard/${roomID}`)

    // ✅ Load remote changes
    const unsubscribe = onValue(boardRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        store.mergeRemoteChanges(() => {
          store.loadSnapshot(data)
        })
      }
    })

    // ✅ Listen & sync to Firebase
    const cleanup = store.listen((_, snapshot) => {
      try {
        const clean = JSON.parse(JSON.stringify(snapshot)) // ✅ strip undefined, functions
        set(boardRef, clean)
      } catch (err) {
        console.error("Whiteboard save error:", err)
      }
    })

    return () => {
      unsubscribe()
      cleanup()
    }
  }, [roomID, store])

  return (
    <div className="w-full h-full bg-white">
      <Tldraw store={store} autoFocus />
    </div>
  )
}
