import YouTube from 'react-youtube'

export default function YoutubeIFrame() {
  return (
    <YouTube
      videoId='www.youtube.com/embed/videoseries?list=PLiHg0vamiwU2J2r8FbVWruJL4MYlSh0ty&listType=playlist'
      onReady={function (event) {
        console.log('REAY')
        event.target.setVolume(0)
      }}
      onError={() => {
        console.log('ERRR')
      }}
      onPlay={() => {
        console.log('PLAY')
      }}
    />
  )
}
// https://www.youtube.com/embed/videoseries?list=PLiHg0vamiwU2J2r8FbVWruJL4MYlSh0ty
