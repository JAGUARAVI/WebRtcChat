
import React from 'react';

class Menu extends React.Component {
    constructor(props) {
        super(props);

        this.comms = props.comms;

        this.state = {
            videoDisabled: false,
            muted: false,
        }
    }

    componentDidMount() {
        this.comms.on('mute', (state) => {
            this.setState({
                muted: state,
            });
        });

        this.comms.on('videoDisable', (state) => {
            this.setState({
                videoDisabled: state,
            });
        });
    }

    render() {
        return (
            <nav className="navbar navbar-dark navbar-expand-md fixed-bottom p-3" style={{
                background: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div className="container-fluid">
                    <div className="row w-100">
                        <div className="col d-inline-flex justify-content-evenly">
                            <div className="btn-group btn-group-sm" role="group">
                                <button className="btn btn-outline-success" type="button" onClick={(() => this.comms.emit('mute', !this.state.muted)).bind(this)}>
                                    {
                                        !this.state.muted ?
                                            (<svg id="local-audio-on[2]" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" className="bi bi-mic-fill">
                                                <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
                                                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
                                            </svg>) : (<svg id="local-audio-off[2]" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" className="bi bi-mic-mute-fill">
                                                <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z" />
                                                <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z" />
                                            </svg>)
                                    }
                                    <span className="d-none d-sm-inline">  <strong id="muteAudio[0]">{this.state.muted ? 'Unmute Mic' : 'Mute Mic'}</strong><br /></span>
                                </button>
                                <button className="btn btn-outline-primary" type="button" onClick={(() => this.comms.emit('videoDisable', !this.state.videoDisabled)).bind(this)}>
                                    {
                                        !this.state.videoDisabled ?
                                            (<svg id="local-video-on[2]" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" className="bi bi-camera-video-fill">
                                                <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z" />
                                            </svg>) : (<svg id="local-video-off[2]" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" className="bi bi-camera-video-off-fill">
                                                <path fillRule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z" />
                                            </svg>)
                                    }
                                    <span className="d-none d-sm-inline">  <strong id="hideVideo[0]">{this.state.videoDisabled ? 'Enable Video' : 'Disable Video'}</strong></span>
                                </button>
                            </div>
                            <button className="btn btn-outline-light btn-sm" type="button" data-bs-target="#modal-1" data-bs-toggle="modal">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" className="bi bi-gear-fill">
                                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                                </svg>
                                <span className="d-none d-sm-inline">  Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

}

export default Menu;