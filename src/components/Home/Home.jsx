import React from 'react';

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            id: '',
            copied: false
        };
    }

    render() {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div
                    className='card text-dark bg-light'
                    style={{ width: '80vw', maxWidth: '600px', boxShadow: '0px 0px 20px 2px var(--bs-purple)' }}
                >
                    <div className='card-body'>
                        <h4 className='card-title'>
                            <strong>Create Meeting</strong>
                        </h4>
                        <p className='card-text'>
                            <button className='btn btn-primary btn-sm' type='button' onClick={() => this.setState({
                                id: Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 5),
                            })}>
                                Click Here
                            </button>
                            <strong>&nbsp;to create a new link.</strong>
                        </p>
                        {
                            this.state.id ? (
                                <div className='alert alert-success' role='alert'>
                                    <div className='mb-2'>
                                        <a
                                            className='alert-link'
                                            href={`https://${window.location.hostname}${window.location.port != 80 ? ':' + window.location.port : ''}/meeting/${this.state.id}`}
                                            target='_blank'
                                            style={{ color: 'var(--bs-alert-color)' }}
                                        >
                                            <strong>
                                                <span style={{ color: 'rgb(15, 147, 102)' }}>
                                                    {`https://${window.location.hostname}${window.location.port != 80 ? ':' + window.location.port : ''}/meeting/${this.state.id}`}
                                                </span>
                                            </strong>
                                            <br />
                                        </a>
                                    </div>
                                    <button className='btn btn-success btn-sm' type='button' onClick={(async () => {
                                        await navigator.clipboard.writeText(`https://${window.location.hostname}${window.location.port != 80 ? ':' + window.location.port : ''}/meeting/${this.state.id}`);
                                        this.setState({ copied: true });
                                    }).bind(this)}>
                                        {
                                            !this.state.copied ? (
                                                <>
                                                    <span>Copy Link&nbsp;</span>
                                                    <i className='far fa-clipboard fs-5' />
                                                </>
                                            ) : (
                                                <>
                                                    <span>Copied&nbsp;</span>
                                                    <i className='fas fa-clipboard-check fs-5' />
                                                </>
                                            )
                                        }
                                    </button>
                                </div>
                            ) : null
                        }
                    </div>
                </div>

            </div>
        );
    }
}

export default Home;