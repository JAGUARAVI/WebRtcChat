import React from 'react';
import './Loading.css';

class Loading extends React.Component {
    render() {
        return (
            <>
                <div className='center'>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                    <div className='wave'></div>
                </div>
            </>
        );
    }
}

export default Loading;