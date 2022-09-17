import React from 'react';
import './Media.css';

class Media extends React.Component {
    constructor(props) {
        super(props);

        this.id = props.id;
        this.comms = props.comms;

        this.state = {
            muted: false,
            volume: this.id == 'local' ? 0 : 100,
            videoDisabled: false,
            name: 'Participant',
            stream: new MediaStream()
        }
    }

    componentDidMount() {
        this.comms.on(this.id, (data) => {
            this.setState({
                name: data.data.name,
                stream: data.stream
            });
        });

        if (this.id === 'local') this.comms.on('mute', (state) => {
            this.setState({ muted: state });
        })

        if (this.id === 'local') this.comms.on('videoDisable', (state) => {
            this.setState({ videoDisabled: state });
        })

        this.comms.on('voiceActivity', (id, state) => {
            if (id == this.id) {
                if (state == true) {
                    if (this.state.muted) document.getElementById(`${this.id}-video`).style.border = '4px solid rgba(245, 66, 66, 1)';
                    else document.getElementById(`${this.id}-video`).style.border = '4px solid rgba(0, 217, 64, 0.75)';
                } else {
                    document.getElementById(`${this.id}-video`).style.border = 'none';
                }
            }
        });

        this.comms.emit('dataRequest', this.id);

        document.getElementById(`${this.id}-volume`).addEventListener('input', (event) => {
            this.setState({ volume: event.target.value });
            document.getElementById(`${this.id}-video`).volume = event.target.value / 100;
        });
    }

    componentDidUpdate() {
        document.getElementById(`${this.id}-video`).volume = this.state.muted ? 0 : this.state.volume / 100;
        document.getElementById(`${this.id}-video`).srcObject = !this.state.videoDisabled ? this.state.stream : null;
    }

    componentWillUnmount() {
        this.comms.off(this.id);
    }

    toggleMute() {
        if (this.id == 'local') this.comms.emit('mute', !this.state.muted);
        else this.setState({ muted: !this.state.muted });
    }

    toggleVideo() {
        if (this.id == 'local') this.comms.emit('videoDisable', !this.state.videoDisabled);
        else this.setState({ videoDisabled: !this.state.videoDisabled });
    }

    render() {
        return (
            <div className='col p-0 m-2' id={`${this.id}-data`} style={{
                userSelect: 'none',
            }} >
                <div className='panel h-100 w-100 '>
                    <video
                        id={`${this.id}-video`}
                        className='rounded img-fluid-shadow w-100 h-100'
                        autoPlay=' '
                        preload='none'
                        style={{
                            minWidth: 350,
                            minHeight: 250,
                            maxWidth: 700,
                            maxHeight: 500,
                            backgroundColor: 'black'
                        }}
                    >
                    </video>

                    <div
                        className='d-inline-flex justify-content-between align-items-center w-100'
                        style={{
                            position: 'relative',
                            top: '-3rem',
                            marginBottom: '-3rem',
                            maxWidth: 700
                        }}
                    >
                        <span style={{ width: 60, marginLeft: 10 }}>
                            {
                                !this.state.muted ? (<svg
                                    id={`${this.id}-audio-on[0]`}
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='1em'
                                    height='1em'
                                    fill='currentColor'
                                    viewBox='0 0 16 16'
                                    className='bi bi-mic-fill'
                                >
                                    <path d='M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z' />
                                    <path d='M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z' />
                                </svg>) : (<svg
                                    id={`${this.id}-audio-off[0]`}
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='1em'
                                        height='1em'
                                        fill='currentColor'
                                        viewBox='0 0 16 16'
                                        className='bi bi-mic-mute-fill'
                                >
                                        <path d='M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z'></path>
                                        <path d='M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z'></path>
                                </svg>)
                            }
                            {
                                !this.state.videoDisabled ? (<svg
                                    id={`${this.id}-video-on[0]`}
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='1em'
                                    height='1em'
                                    fill='currentColor'
                                    viewBox='0 0 16 16'
                                    className='bi bi-camera-video-fill'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z'
                                    ></path>
                                </svg>) : (<svg
                                    id={`${this.id}-video-on[0]`}
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='1em'
                                        height='1em'
                                        fill='currentColor'
                                        viewBox='0 0 16 16'
                                        className='bi bi-camera-video-off-fill'
                                >
                                    <path
                                            fillRule='evenodd'
                                            d='M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z'
                                    ></path>
                                </svg>)
                            }
                        </span>
                        <span id={`${this.id}-name`}>{this.state.name}</span>
                        <div className='dropup'>
                            <button
                                className='btn btn-link btn-sm'
                                aria-expanded='false'
                                data-bs-toggle='dropdown'
                                data-bs-auto-close='outside'
                                type='button'
                                name='view-options'
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='1em'
                                    height='1em'
                                    fill='currentColor'
                                    viewBox='0 0 16 16'
                                    className='bi bi-three-dots'
                                    style={{ fontSize: 20, color: 'var(--bs-white)' }}
                                >
                                    <path d='M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'></path>
                                </svg>
                            </button>
                            <div className='dropdown-menu dropdown-menu-end dropdown-menu-dark'>
                                <a
                                    id={this.id}
                                    className='dropdown-item d-inline-flex justify-content-around align-items-xl-center'
                                    onClick={this.toggleMute.bind(this)}
                                >
                                    {
                                        !this.state.muted ? (<svg
                                            id={`${this.id}-audio-on[1]`}
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='1em'
                                            height='1em'
                                            fill='currentColor'
                                            viewBox='0 0 16 16'
                                            className='bi bi-mic-fill'
                                        >
                                            <path d='M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z' />
                                            <path d='M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z'></path>
                                        </svg>) : (<svg
                                            id={`${this.id}-audio-off[1]`}
                                                xmlns='http://www.w3.org/2000/svg'
                                                width='1em'
                                                height='1em'
                                                fill='currentColor'
                                                viewBox='0 0 16 16'
                                                className='bi bi-mic-mute-fill'
                                        >
                                                <path d='M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z'></path>
                                                <path d='M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z'></path>
                                        </svg>)
                                    }
                                    <span id={`${this.id}-mute`}>{this.state.muted ? 'Unmute' : 'Mute'}</span>
                                </a>
                                <a
                                    id={this.id}
                                    className='dropdown-item d-inline-flex justify-content-around align-items-xl-center'
                                    onClick={this.toggleVideo.bind(this)}
                                >
                                    {
                                        !this.state.videoDisabled ? (<svg
                                            id={`${this.id}-video-on[1]`}
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='1em'
                                            height='1em'
                                            fill='currentColor'
                                            viewBox='0 0 16 16'
                                            className='bi bi-camera-video-fill'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z'
                                            ></path>
                                        </svg>) : (<svg
                                            id={`${this.id}-video-off[1]`}
                                                xmlns='http://www.w3.org/2000/svg'
                                                width='1em'
                                                height='1em'
                                                fill='currentColor'
                                                viewBox='0 0 16 16'
                                                className='bi bi-camera-video-off-fill'
                                        >
                                            <path
                                                    fillRule='evenodd'
                                                    d='M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z'
                                            ></path>
                                        </svg>)
                                    }
                                    <span id={`${this.id}-hide`}>{this.state.videoDisabled ? 'Show Video' : 'Hide Video'}</span>
                                </a>
                                <a className='dropdown-item d-xl-flex align-items-xl-center'>
                                    <input
                                        id={`${this.id}-volume`}
                                        className='form-range'
                                        type='range'
                                        min={0}
                                        max={100}
                                        defaultValue={this.state.volume}
                                        style={{ userSelect: 'none' }}
                                        step={5}
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

export default Media;