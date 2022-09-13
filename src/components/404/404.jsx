import React from 'react';
import {
    Link,
} from 'react-router-dom';
import './404.css'

class Error404 extends React.Component {
    render() {
        return (
            <section style={{ height: '100vh' }}>
                <div data-bss-parallax-bg='true' style={{ height: '100%' }}>
                    <div className='container h-100'>
                        <div className='row h-100' style={{ height: '100%' }}>
                            <div className='col d-flex d-sm-flex d-md-flex justify-content-center align-items-center justify-content-md-start align-items-md-center justify-content-xl-center'>
                                <div>
                                    <div className='error mx-auto' data-text={404}>
                                        <h1
                                            className='text-uppercase p-0'
                                            style={{
                                                fontSize: '7.5rem',
                                                lineHeight: 1,
                                                zIndex: -1,
                                                fontFamily: 'Nunito, sans-serif'
                                            }}
                                        >
                                            404
                                        </h1>
                                    </div>
                                    <p className='fs-3 text-center my-3'>Page Not Found</p>
                                    <Link className='btn btn-outline-success m-2' to={'/'} style={{
                                        display: 'block'
                                    }}>
                                        Go to Home
                                    </Link>
                                    <Link className='btn btn-outline-primary m-2' to={-1} style={{
                                        display: 'block'
                                    }}>
                                        Go Back
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );

    }
}

export default Error404;