import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Menu from '../Menu/Menu';
import Media from '../Media/Media';
import Loading from '../Loading/Loading';
import './Main.css';
import io from 'socket.io-client';
import 'webrtc-adapter';
import EventEmitter from '../../EventEmitter';
import { supabase } from '../../supabaseClient';
import { getTfLite } from '../../core/helpers/getTfLite';
import { buildCanvas2dPipeline } from '../../pipelines/canvas2d/canvas2dPipeline';

const withParams = (props) => {
  return props => <App {...props} params={useParams()} />;
}

const SIGNALING_SERVER = 'https://videovoicechat.jaguaravi.repl.co';

const CONSTRAINS = {
  audio: {
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true
  },
  video: {
    width: { max: 1920 },
    height: { max: 1080 },
    facingMode: 'user'
  }
};

const SERVERS = [
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

const AUDIO_THRESHOLD = 0.01;

const DEBUG = false;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      message: 'Connecting to server...',
      connected: false,
      stream: new MediaStream(),
      localStream: new MediaStream(),
      media: [],
      peers: [],
      meeting: {
        name: 'My Meeting',
        id: this.props.params.id,
      },
      selected: {
        microphone: localStorage.getItem('microphone'),
        camera: localStorage.getItem('camera'),
        speaker: localStorage.getItem('speaker'),
      },
      devices: { microphones: [], cameras: [], speakers: [], },
      background: {
        type: 'none',
        image: '',
      }
    };

    this.renderRequestId = null;
    this.canvasRender = async () => { }
    this.updatePostProcessingConfig = () => { };

    this.canvas = document.createElement('canvas');
    this.video = document.createElement('video');

    {
      this.comms = new EventEmitter();

      this.comms.on('dataRequest', (id) => {
        this.comms.emit(id, this.state.media.find((val) => val.id === id));
      });

      this.comms.on('mute', (state) => {
        this.state.stream.getAudioTracks().map((track) => track.enabled = !state);
        this.state.media.find((val) => val.id === 'local').data.clientMute = state;
      });

      this.comms.on('videoDisable', (state) => {
        this.state.stream.getVideoTracks().map((track) => track.enabled = !state);
        this.state.media.find((val) => val.id === 'local').data.clientVideoHide = state;
      });

      document.title = this.state.meeting.name;

      this.socket = io(SIGNALING_SERVER);
      this.socket.on('connect', async () => {
        this.socket.emit('auth', props.session.access_token);
        this.socket.on('ok', () => {
          if (DEBUG) console.log('Connected to Signaling Server');
          this.state.media.push({
            id: 'local',
            type: 'local',
            connection: null,
            data: { name: `${supabase.auth.user().user_metadata.username} (Me)`, clientMute: false, clientVideoHide: false, peerMute: false, peerVideoHide: false, position: 0 },
            stream: this.state.stream,
            sender: [null, null]
          });

          this.setState({
            message: 'Loading devices...',
          });

          this.onConnection.bind(this)();
        })
      });


      const intervals = {};

      setInterval(() => {
        this.state.peers.forEach((peer) => {
          const id = peer.id;
          const receiver = peer.connection.getReceivers().find((r) => r.track.kind == 'audio');

          if (receiver && receiver.getSynchronizationSources) {
            const source = receiver.getSynchronizationSources()[0];
            if (source?.audioLevel > AUDIO_THRESHOLD) {
              this.comms.emit('voiceActivity', id, true);

              const func = () => {
                const newSource = receiver.getSynchronizationSources()[0];
                if (newSource?.audioLevel <= 0.01) {
                  this.comms.emit('voiceActivity', id, false);

                  clearInterval(intervals[id]);
                  intervals[id] = null;
                }
              };

              if (!intervals) {
                intervals[id] = setInterval(func, 2000);
              } else {
                clearInterval(intervals[id]);
                intervals[id] = setInterval(func, 2000);
              }
            }
          }
        });
      }, 100);
    }
  }

  async onConnection() {
    if (!this.state.stream.getTracks().length) await this.refreshStream();

    let ready = this.state.stream.getVideoTracks().length > 0;
    while (!ready) {
      await new Promise((resolve) => setTimeout(resolve, 10))
      ready = this.state.stream.getVideoTracks().length > 0;
    }

    const data = {
      channel: this.state.meeting.id,
      userdata: {
        name: supabase.auth.user().user_metadata.username || supabase.auth.user().email.toString().split('@')[0],
        id: supabase.auth.user().id,
        avatar: supabase.auth.user().user_metadata.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
      }
    };
    this.socket.emit('join', data);
    this.setState({
      loading: false
    });

    this.socket.on('disconnect', (() => {
      console.log('Disconnected from Signaling Server\nAttempting to reconnect...');
      this.state.peers.forEach((peer) => peer.connection.close());

      this.setState({
        loading: true,
      });

      try {
        this.setState({
          connected: false,
          peers: [],
          media: []
        });
      } catch (e) {
        this.state.connected = false;
        this.state.peers = [];
        this.state.media = [];
      }

      this.socket = io(SIGNALING_SERVER);
    }).bind(this));

    this.socket.on('addPeer', (async (config) => {
      if (DEBUG) console.log('Signaling server said to add peer:', config);
      const peerId = config.peer_id;

      if (this.state.peers.some((p) => p.id == peerId) || this.state.media.some((m) => m.data.id == config.userdata.id) || config.userdata.id == supabase.auth.user().id) {
        console.log('Already connected to peer');
        return;
      }

      const connection = new RTCPeerConnection({
        iceServers: SERVERS,
      });

      this.state.peers.push({
        id: peerId,
        connection: connection,
      });

      connection.onicecandidate = ((event) => {
        if (event.candidate) {
          this.socket.emit('relayICECandidate', {
            peer_id: peerId,
            ice_candidate: {
              sdpMLineIndex: event.candidate.sdpMLineIndex,
              candidate: event.candidate.candidate,
            },
          });
        }
      }).bind(this);

      const remote = new MediaStream();

      connection.ontrack = async (event) => {
        if (DEBUG) console.log('ontrack', event.track);
        if (event.track.kind === 'audio') await event.track.applyConstraints({ audio: CONSTRAINS.audio });
        remote.addTrack(event.track);
      };

      const localAudio = this.state.stream.getAudioTracks()[0];
      const localVideo = this.state.stream.getVideoTracks()[0];
      if (DEBUG) console.log('Sending AV:', localAudio, localVideo);

      const sender = [
        localAudio ? connection.addTrack(localAudio, this.state.stream) : null,
        localVideo ? connection.addTrack(localVideo, this.state.stream) : null,
      ];

      if (DEBUG) console.log('sender', sender);

      this.state.media.push({
        id: peerId,
        type: 'remote',
        connection,
        data: { id: config.userdata.id, name: config.userdata.name, clientMute: false, clientVideoHide: false, peerMute: false, peerVideoHide: false, position: this.state.media.length },
        stream: remote,
        sender
      });

      if (config.should_create_offer) {
        if (DEBUG) console.log('Creating RTC offer to', peerId);

        const offer = await connection.createOffer();

        if (DEBUG) console.log('Local offer is: ', offer);

        await connection.setLocalDescription(offer);

        this.socket.emit('relaySessionDescription', {
          peer_id: peerId,
          session_description: offer,
        });

        if (DEBUG) console.log('Offer setLocalDescription succeeded');
      }
    }).bind(this));

    this.socket.on('sessionDescription', (async (config) => {
      if (DEBUG) console.log('Remote description received: ', config.session_description);

      const peerId = config.peer_id;
      const connection = this.state.peers.find((p) => p.id == peerId).connection;
      const remoteDescription = config.session_description;

      const desc = new RTCSessionDescription(remoteDescription);
      await connection.setRemoteDescription(desc);

      if (DEBUG) console.log('setRemoteDescription succeeded');

      if (remoteDescription.type == 'offer') {
        if (DEBUG) console.log('Creating answer');

        const answer = await connection.createAnswer();

        if (DEBUG) console.log('Answer created: ', answer);

        await connection.setLocalDescription(answer);

        this.socket.emit('relaySessionDescription', {
          peer_id: peerId,
          session_description: answer,
        });

        if (DEBUG) console.log('Answer setLocalDescription succeeded');
      }

      if (DEBUG) console.log('Description Object: ', desc);
    }).bind(this))

    this.socket.on('iceCandidate', ((config) => {
      const connection = this.state.peers.find((p) => p.id == config.peer_id).connection;
      const iceCandidate = config.ice_candidate;
      connection.addIceCandidate(new RTCIceCandidate(iceCandidate));
    }).bind(this));

    this.socket.on('removePeer', ((config) => {
      if (DEBUG) console.log('Signaling server said to remove peer:', config);

      const peerId = config.peer_id;

      const connection = this.state.peers.find((p) => p.id == peerId).connection;
      if (connection) connection.close();

      if (this.comms._events[peerId]) delete this.comms._events[peerId];

      try {
        this.setState({
          peers: this.state.peers.filter((p) => p.id != peerId),
          media: this.state.media.filter((m) => m.id != peerId)
        });
      } catch (e) {
        this.state.peers = this.state.peers.filter((p) => p.id != peerId);
        this.state.media = this.state.media.filter((m) => m.id != peerId);
      }
    }).bind(this));
  }

  async refreshStream() {
    if (DEBUG) console.log('refreshStream');
    const stream = await navigator.mediaDevices.getUserMedia(Object.assign(CONSTRAINS, {
      video: {
        deviceId: this.state.selected.camera,
      },
      audio: {
        deviceId: this.state.selected.microphone,
      }
    })).catch((err) => {
      console.log('Access denied for audio/video');
      console.log('Starting with empty stream...');
      return new MediaStream();
    });

    this.state.localStream.getTracks().map((track) => this.state.localStream.removeTrack(track));
    this.state.stream.getAudioTracks().map((track) => this.state.stream.removeTrack(track));

    stream.getTracks().map((track) => this.state.localStream.addTrack(track));
    stream.getAudioTracks().map((track) => this.state.stream.addTrack(track));

    this.video.srcObject = this.state.localStream;

    this.updateRemoteStreams.bind(this)();
  }

  async updateRemoteStreams(audio, video) {
    if (!audio) audio = this.state.stream.getAudioTracks()[0];
    if (!video) video = this.state.stream.getVideoTracks()[0];

    if (DEBUG) console.log('updateRemoteStreams', audio, video);

    this.state.media.map(async (media) => {
      if (media.type == 'local' || media.id == 'local') return;

      if (audio != null) {
        if (media.sender[0]) media.sender[0] = await media.sender[0].replaceTrack(audio);
        else media.sender[0] = this.state.peers.find((p) => p.id == media.id).connection.addTrack(audio, this.state.stream);
      }

      if (video != null) {
        if (media.sender[1]) media.sender[1] = await media.sender[1].replaceTrack(video);
        else media.sender[1] = this.state.peers.find((p) => p.id == media.id).connection.addTrack(video, this.state.stream);
      }
    })
  }

  getDevices() {
    return new Promise(async (res, rej) => {
      await this.refreshStream();

      const devices = await navigator.mediaDevices.enumerateDevices();

      let cameras = devices.filter((device) => device.kind === 'videoinput');
      let microphones = devices.filter((device) => device.kind === 'audioinput');
      let speakers = devices.filter((device) => device.kind === 'audiooutput');

      cameras = cameras.map((device) => {
        device.selected = this.state.devices.cameras.some((val) => val.deviceId == this.state.selected.camera) ? device.deviceId === this.state.selected.camera : device.deviceId === 'default'
        return device;
      });

      microphones = microphones.map((device) => {
        device.selected = this.state.devices.microphones.some((val) => val.deviceId == this.state.selected.microphone) ? device.deviceId === this.state.selected.microphone : device.deviceId === 'default'
        return device;
      });

      speakers = speakers.map((device) => {
        device.selected = this.state.devices.speakers.some((val) => val.deviceId == this.state.selected.speaker) ? device.deviceId === this.state.selected.speaker : device.deviceId === 'default'
        return device;
      });

      return res([cameras, microphones, speakers]);
    });
  }

  async refreshDevices() {
    const devices = await this.getDevices();
    this.setState({
      devices: {
        cameras: devices[0],
        microphones: devices[1],
        speakers: devices[2]
      }
    });
  }

  async renderBg() {
    await this.canvasRender();
    this.renderRequestId = requestAnimationFrame(this.renderBg.bind(this));
  }

  async componentDidMount() {
    await this.refreshDevices.bind(this)();

    const [tflite] = await getTfLite();

    const { height, width } = this.state.localStream.getVideoTracks()[0]?.getSettings();

    const video = document.createElement('video');
    video.srcObject = this.state.localStream;
    video.classList.add('d-none');
    document.body.appendChild(video);

    video.play();

    const canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;

    const data = buildCanvas2dPipeline({
      htmlElement: video,
      width,
      height,
    }, { type: this.state.background.type }, { inputResolution: '160x96' }, canvas, tflite);

    this.canvasRender = data.render;
    this.updatePostProcessingConfig = data.updatePostProcessingConfig;

    this.updatePostProcessingConfig({
      smoothSegmentationMask: true,
    });

    const stream = document.getElementById('canvas').captureStream(30);
    this.state.stream.getVideoTracks().map((track) => this.state.stream.removeTrack(track));
    stream.getTracks().map((track) => this.state.stream.addTrack(track));

    this.renderBg.bind(this)();
  }

  componentDidUpdate() {
    if (this.state.selected.camera != localStorage.getItem('camera') || this.state.selected.microphone != localStorage.getItem('microphone') || this.state.selected.speaker != localStorage.getItem('speaker')) {
      localStorage.setItem('microphone', this.state.selected.microphone);
      localStorage.setItem('camera', this.state.selected.camera);
      localStorage.setItem('speaker', this.state.selected.speaker);

      this.refreshStream.bind(this)();
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.renderRequestId);
    this.socket.close();
  }

  render() {
    const Settings = (
      <div className='modal fade text-dark' role='dialog' tabIndex={-1} id='modal-1' style={{ background: 'var(--bs-border-color-translucent)' }} data-component='SettingsModal'>
        <div className='modal-dialog modal-xl modal-dialog-centered modal-fullscreen-lg-down' role='document'>
          <div className='modal-content'>
            <div className='modal-header' style={{ '--bsBodyColor': 'var(--bs-gray-dark)', color: 'var(--bs-gray-dark)' }}>
              <h4 className='modal-title'>Settings</h4>
              <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' />
            </div>
            <div className='modal-body'>
              <div className='container'>
                <ul className='nav nav-pills nav-justified' role='tablist' style={{ margin: '10px', padding: '10px' }}>
                  <li className='nav-item' role='presentation'>
                    <a className='nav-link active d-inline-flex justify-content-center align-items-center' role='tab' data-bs-toggle='pill' href='#tab-1' style={{ '--bsBodyBg': 'var(--bs-blue)' }}>
                      <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' fill='currentColor' viewBox='0 0 16 16' className='bi bi-gear-fill'>
                        <path d='M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z'>
                        </path>
                      </svg>
                      &nbsp; General
                    </a>
                  </li>
                  <li className='nav-item' role='presentation'>
                    <a className='nav-link d-inline-flex justify-content-center align-items-center' role='tab' data-bs-toggle='pill' href='#tab-2'>
                      <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' fill='currentColor' viewBox='0 0 16 16' className='bi bi-mic-fill'>
                        <path d='M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z' />
                        <path d='M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z'>
                        </path>
                      </svg>
                      &nbsp; Audio
                    </a>
                  </li>
                  <li className='nav-item' role='presentation'>
                    <a className='nav-link d-inline-flex justify-content-center align-items-center' role='tab' data-bs-toggle='pill' href='#tab-3'>
                      <svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' fill='currentColor' viewBox='0 0 16 16' className='bi bi-camera-video-fill'>
                        <path fillRule='evenodd' d='M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z'>
                        </path>
                      </svg>
                      &nbsp; Video
                    </a>
                  </li>
                </ul>
                <div className='tab-content'>
                  <div className='tab-pane fade show active' role='tabpanel' id='tab-1'>
                    <p>Nothing Here Yet...</p>
                  </div>
                  <div className='tab-pane fade' role='tabpanel' id='tab-2'>
                    <div className='row'>
                      <div className='col d-flex justify-content-around col-12 p-4'>
                        <span>Speaker</span>
                        <select id='speaker' className='form-select-sm' onChange={(elem) => this.setState((state) => ({ selected: { ...state.selected, speaker: elem.target.value } }))} value={this.state.selected.speaker || ''}>
                          {
                            this.state.devices.speakers.map((speaker) => (
                              <option value={speaker.deviceId} key={speaker.label}>{speaker.label}</option>
                            ))
                          }
                        </select>
                      </div>
                      <div className='col d-flex justify-content-around col-12 p-4'>
                        <span>Microphone</span>
                        <select id='microphone' className='form-select-sm' onChange={(elem) => this.setState((state) => ({ selected: { ...state.selected, microphone: elem.target.value } }))} value={this.state.selected.microphone || ''}>
                          {
                            this.state.devices.microphones.map((microphone) => (
                              <option value={microphone.deviceId} key={microphone.label}>{microphone.label}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className='tab-pane fade' role='tabpanel' id='tab-3'>
                    <div className='row'>
                      <div className='col-lg-6 d-flex justify-content-around align-items-sm-center align-items-md-center align-items-lg-center align-items-xl-center align-items-xxl-center col-md-12 col-lg-6 p-4'>
                        <span>Camera</span>
                        <select id='camera' className='form-select-sm' onChange={(elem) => this.setState((state) => ({ selected: { ...state.selected, camera: elem.target.value } }))} value={this.state.selected.camera || ''}>
                          {
                            this.state.devices.cameras.map((camera) => (
                              <option value={camera.deviceId} key={camera.label}>{camera.label}</option>
                            ))
                          }
                        </select>
                      </div>
                      <div className='col d-flex justify-content-around justify-content-xl-center align-items-xl-center col-md-12 p-4' style={{ paddingTop: '12px' }}>
                        <canvas id='canvas'></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='modal-footer d-inline-flex justify-content-center'><button className='btn btn-primary btn-sm align-items-center' type='button' onClick={this.refreshDevices.bind(this)}><i className='fa fa-refresh' />&nbsp; Refresh Devices</button></div>
          </div>
        </div >
      </div >
    );

    const { meeting: { name } } = this.state;

    return this.props.session ? (
      <>
        {
          this.state.loading ? <Loading message={this.state.message} /> : null
        }
        <section className='py-5 mt-5'>
          <div className='container'>
            <div className='row mb-3'>
              <div className='col-md-8 col-xl-6 text-center mx-auto'>
                <h2 className='fw-bold'>{name}</h2>
              </div>
            </div>
            <div
              id='data-row'
              className='row mx-auto'
            >
              {
                this.state.media.map((media) => (
                  <Media id={media.id} key={media.id} comms={this.comms} />
                ))
              }
            </div>

          </div>
        </section>
        {Settings}
        {

        }
        <Menu comms={this.comms} />
      </>
    ) : (
      <Navigate to={'/signin'} />
    );
  }
}

export default withParams(App);