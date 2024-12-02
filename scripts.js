let stream = null;

const constraints = {
  audio: true,
  video: true,
};

const getUserMedia = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log(stream, '!');
  } catch (error) {
    console.log('getUserMedia Error:', error);
  }
};

document.querySelector('#share').addEventListener('click', event => {
  getUserMedia();
});
