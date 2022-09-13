import React from 'react';
import { supabase } from '../../supabaseClient';
import { Navigate } from 'react-router-dom';

class Profile extends React.Component {
    constructor(props) {
        super(props);
    }

    handleDetails() {
    }

    render() {
        const user = supabase.auth.user();

        return !user ? (<Navigate to={'/signin'} />) : (
            <>
                <section>
                    <div className='container'>
                        <div className='row m-4'>
                            <div className='col-12 text-center mb-4'>
                                <h1>Profile</h1>
                            </div>
                            <div className='col-auto col-sm-12 col-md-4 mb-4'>
                                <div
                                    className='card'
                                    style={{ boxShadow: '0px 0px 20px rgba(0,0,0,0.25)' }}
                                >
                                    <div className='card-body text-center'>
                                        <img
                                            className='rounded-circle img-fluid d-inline-flex p-3'
                                            src='assets/img/products/2.jpg?h=104fcc18ad179e4b0b9e0ee12b849bed'
                                            style={{ width: '100%', maxWidth: 300, aspectRatio: 1 }}
                                        />
                                        <button
                                            className='btn btn-outline-primary'
                                            type='button'
                                            data-bs-target='#modal-1'
                                            data-bs-toggle='modal'
                                        >
                                            <i className='fas fa-edit' />
                                            &nbsp; Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className='col-auto col-sm-12 col-md-8'>
                                <div className='row'>
                                    <div className='col-12 mb-3'>
                                        <div
                                            className='card'
                                            style={{ boxShadow: '0px 0px 20px rgba(0,0,0,0.25)' }}
                                        >
                                            <div className='card-body'>
                                                <h4 className='card-title'>Details</h4>
                                                <form onSubmit={this.handleDetails.bind()}>
                                                    <div className='mb-2'>
                                                        <label className='form-label'>Username</label>
                                                        <input
                                                            className='form-control form-control-sm'
                                                            type='text'
                                                            autofocus=''
                                                            value={user.user_metadata.username}
                                                        />
                                                        <small className='form-text'>
                                                            This will be your default name when joining meetings.
                                                        </small>
                                                    </div>
                                                    <div className='mb-4'>
                                                        <label className='form-label'>Email</label>
                                                        <input
                                                            className='form-control form-control-sm'
                                                            type='email'
                                                            inputMode='email'
                                                            value={user.email}
                                                        />
                                                    </div>
                                                    <div className='mb-4'>
                                                        <label className='form-label'>Password</label>
                                                        <button
                                                            className='btn btn-light btn-sm d-block w-100'
                                                            type='button'
                                                        >
                                                            Change Password
                                                        </button>
                                                    </div>
                                                    <div className='text-start mt-2'>
                                                        <button className='btn btn-outline-primary' type='button'>
                                                            <i className='fas fa-save' />
                                                            &nbsp; Save Details
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div
                    className='modal fade text-dark'
                    role='dialog'
                    tabIndex={-1}
                    id='modal-1'
                >
                    <div
                        className='modal-dialog modal-lg modal-dialog-centered modal-fullscreen-md-down'
                        role='document'
                    >
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h4 className='modal-title'>Change Avatar</h4>
                                <button
                                    type='button'
                                    className='btn-close'
                                    data-bs-dismiss='modal'
                                    aria-label='Close'
                                />
                            </div>
                            <div className='modal-body'>
                                <p>Upload your new Avatar</p>
                                <form>
                                    <input
                                        className='form-control'
                                        type='file'
                                        data-bs-toggle='tooltip'
                                        data-bss-tooltip=''
                                        required=''
                                        accept='image/*'
                                        name='avatar'
                                        title='Max File SIze: 1MB'
                                    />
                                </form>
                            </div>
                            <div className='modal-footer'>
                                <button
                                    className='btn btn-light'
                                    type='button'
                                    data-bs-dismiss='modal'
                                >
                                    Cancel
                                </button>
                                <button className='btn btn-outline-primary' type='button'>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>);
    }
}

export default Profile;