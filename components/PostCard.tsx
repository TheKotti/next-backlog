import { useState } from 'react'
import { useRouter } from 'next/router'

export default function PostCard({ post }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Delete post
  const deletePost = async (postId) => {
    //change deleting state
    setDeleting(true)

    try {
      // Delete post
      await fetch('/api/games', {
        method: 'DELETE',
        body: postId,
      })

      // reset the deleting state
      setDeleting(false)

      // reload the page
      return router.push(router.asPath)
    } catch (error) {
      // stop deleting state
      return setDeleting(false)
    }
  }
  return (
    <>
      <li>
        <h3>{post.title}</h3>
        <p>{post.content}</p>
        <small>{new Date(post.createdAt).toLocaleDateString()}</small>
        <br />
        <button type='button' onClick={() => deletePost(post['_id'])}>
          {deleting ? 'Deleting' : 'Delete'}
        </button>
      </li>
    </>
  )
}
