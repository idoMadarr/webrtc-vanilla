const videoEl = document.querySelector('#my-video');
const audioInputEl = document.querySelector('#audio-input');
const audioOutputEl = document.querySelector('#audio-output');
const videoInputEl = document.querySelector('#video-input');

let stream = null;
let mediaRecorder; // new MediaRecorder
let mediaRecordBlobs; // Blob Array [{size: 25629697, type: "video/mp4" ...}]
let sharedMediaStream;

const constraints = {
  audio: true,
  video: true,
};

const getUserMedia = async () => {
  try {
    // Getting the default media stream from the device
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    // console.log(stream, "getUserMedia");
    // {
    // active: true
    // id: "d62de611-1774-43e3-9678-88bb97184ea6"
    // onaddtrack: null
    // onremovetrack: null
    // }
  } catch (error) {
    console.log('getUserMedia Error:', error);
  }
};

const showMyFeed = () => {
  // Connect the stream to video tag
  videoEl.srcObject = stream;
  const tracks = stream.getTracks(); // Get all media stream tracks
  // console.log(tracks, "getTracks");
  // [
  // MediaStreamTrack {kind: "audio", id: "606d65b1-x...", label: "MacBook Pro Microphone", enabled: true, contentHint: "", …}
  // MediaStreamTrack {kind: "video", id: "99f64fae-e..."
  // ]
};

const stopMyFeed = () => {
  stream.getTracks().forEach(track => {
    // Stop every media stream track (Audio/Video)
    track.stop();
  });
};

// An Object that include all the supported features of the browser
const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
// console.log(supportedConstraints, "supportedConstraints");
// {
// aspectRatio: true
// backgroundBlur: true
// deviceId: true
// displaySurface: true
// echoCancellation: true
// facingMode: true
// frameRate: true
// groupId: true
// height: true
// powerEfficient: true
// sampleRate: true
// sampleSize: true
// torch: true
// volume: true
// whiteBalanceMode: true
// width: true
// zoom: true
// }

const changeVideoSize = () => {
  if (stream) {
    stream.getVideoTracks().forEach(track => {
      // Object that contain the maximum capabilities of each feature on the broswer
      const capabilities = track.getCapabilities();
      // console.log(capabilities, "capabilities");
      // {
      // deviceId: "381BFF7CDCDEED8AED9326E4F5517E497AF274AA"
      // echoCancellation: [true, false] (2)
      // groupId: "672072393AAC0B597E16928AEE8D81E274E453D7"
      // sampleRate: {max: 96000, min: 8000}
      // volume: {max: 1, min: 0}
      // }

      const width = document.querySelector('#vid-width').value;
      const height = document.querySelector('#vid-height').value;

      const newConstraints = {
        width: {
          exact:
            width > capabilities.width.max ? capabilities.width.max : width,
        },
        height: {
          exact:
            height > capabilities.height.max ? capabilities.height.max : height,
        },
        // framRate: 5
      };
      track.applyConstraints(newConstraints);
    });
  }
};

const startRecording = () => {
  if (!stream) return;

  console.log('Start Recording...');
  mediaRecordBlobs = [];
  mediaRecorder = new MediaRecorder(stream);

  // Listener that run when a data is available from mediaRecorder
  mediaRecorder.ondataavailable = e => {
    console.log('Data from record is available!');
    mediaRecordBlobs.push(e.data);
  };
  mediaRecorder.start();
};

const stopRecording = () => {
  if (!mediaRecorder) return;

  console.log('Stop Recording...');
  mediaRecorder.stop();
};

const playRecording = () => {
  if (!mediaRecordBlobs) return;

  const superBuffer = new Blob(mediaRecordBlobs);
  const recordVideoEl = document.querySelector('#other-video');
  recordVideoEl.src = window.URL.createObjectURL(superBuffer);
  recordVideoEl.controls = true;
  recordVideoEl.play();
};

const shareScreen = async () => {
  const options = {
    video: true,
    audio: false,
    surfaceSwitching: 'include', // can be 'include' or 'exclude'
  };

  try {
    sharedMediaStream = navigator.mediaDevices.getDisplayMedia(options);
  } catch (error) {
    console.log(error);
  }
};

const fetchAvailableDevices = async () => {
  try {
    // Fetch a list of the available media input and output devices
    const availables = await navigator.mediaDevices.enumerateDevices();
    // console.log(availables, "availables");
    // [
    // {
    // deviceId:"c96743b69ee91db42a3241ccb7e21f25dcca98aef59d4c97a97e01064c94d2b9"
    // groupId: "fec53a2f76f53b90fdeda18a2befe87453957e7df39471eaaeff5866d33913fa"
    // kind: "videoinput"
    // label: "FaceTime HD Camera (2C0E:82E3)"
    // }...
    // ]

    availables.forEach(device => {
      const optionElement = document.createElement('option');
      optionElement.value = device.deviceId;
      optionElement.text = device.label;

      if (device.kind === 'audioinput') {
        audioInputEl.appendChild(optionElement);
      }

      if (device.kind === 'audiooutput') {
        audioOutputEl.appendChild(optionElement);
      }

      if (device.kind === 'videoinput') {
        videoInputEl.appendChild(optionElement);
      }
    });
  } catch (error) {
    console.log('Availables Error:', error);
  }
};

const changeAudioInput = async event => {
  const deviceId = event.target.value;
  const newConstraints = {
    audio: {
      deviceId: { exact: deviceId },
    },
    video: true,
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(newConstraints);
    // console.log(stream.getAudioTracks()); // Check the update deviceId in the stream
  } catch (error) {
    console.log('changeAudioInput Error: ', error);
  }
};

const changeAudioOutput = async event => {
  await videoInputEl.setSinkId(event.target.value);
};

const changeVideo = async event => {
  const deviceId = event.target.value;
  const newConstraints = {
    video: {
      deviceId: { exact: deviceId },
    },
    audio: true,
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(newConstraints);
    console.log(stream.getVideoTracks()); // Check the update deviceId in the stream
  } catch (error) {
    console.log('changeAudioInput Error: ', error);
  }
};

fetchAvailableDevices();

document.querySelector('#share').addEventListener('click', getUserMedia);
document.querySelector('#show-video').addEventListener('click', showMyFeed);
document.querySelector('#stop-video').addEventListener('click', stopMyFeed);
document
  .querySelector('#change-size')
  .addEventListener('click', changeVideoSize);
document
  .querySelector('#start-record')
  .addEventListener('click', startRecording);
document.querySelector('#stop-record').addEventListener('click', stopRecording);
document.querySelector('#play-record').addEventListener('click', playRecording);
document.querySelector('#share-screen').addEventListener('click', shareScreen);
document
  .querySelector('#audio-input')
  .addEventListener('change', changeAudioInput);
document
  .querySelector('#audio-output')
  .addEventListener('change', changeAudioOutput);
document.querySelector('#video-input').addEventListener('change', changeVideo);
