import React from 'react';
import {
    Navigate,
    Link,
} from 'react-router-dom';
import { supabase } from '../../supabaseClient.js'

class Signup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: '',
            success: 0,
            loading: false
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ loading: true });

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        supabase.auth.signUp({
            email,
            password
        }, {
            data: {
                username
            }
        }).then(({ user, error }) => {
            if (error) this.setState({ error: error.message });
            else {
                const date = new Date(user.created_at);
                if (Date.now() - date.getTime() > 1000 * 60) {
                    this.setState({ success: 1 });
                } else {
                    this.setState({ success: 2 });
                }
            }
        }).catch((error) => {
            this.setState({ error: error.message });
        }).then(() => {
            this.setState({ loading: false });
        });
    }

    render() {
        return this.state.success == 2 ? (<Navigate to={'/signin?signup=true'} replace={true} />) : this.state.success == 1 ? (<Navigate to={'/signin?signup=false'} replace={true} />) : (
            <section className='py-5 mt-5'>
                <div className='container py-5'>
                    <div className='row mb-4 mb-lg-5'>
                        <div className='col-md-8 col-xl-6 text-center mx-auto'>
                            <p className='fw-bold text-success mb-2'>Sign Up</p>
                            <h2 className='fw-bold'>New User?</h2>
                        </div>
                    </div>
                    <div className='row d-flex justify-content-center'>
                        <div className='col-md-6 col-xl-4'>
                            <div className='card'>
                                <div className='card-body text-center d-flex flex-column align-items-center'>
                                    <div className='bs-icon-xl bs-icon-circle bs-icon-primary shadow bs-icon my-4'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            width='1em'
                                            height='1em'
                                            fill='currentColor'
                                            viewBox='0 0 16 16'
                                            className='bi bi-person'
                                        >
                                            <path d='M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z'></path>
                                        </svg>
                                    </div>
                                    <form id='signUp' onSubmit={this.handleSubmit.bind(this)}>
                                        {
                                            this.state.error ? (
                                                <div className='alert alert-danger w-100' role='alert'>
                                                    {this.state.error}
                                                </div>
                                            ) : null
                                        }
                                        <div className='mb-3'>
                                            <input
                                                id='username'
                                                className='form-control'
                                                type='text'
                                                name='username'
                                                placeholder='Username'
                                                required='required'
                                            />
                                        </div>
                                        <div className='mb-3'>
                                            <input
                                                id='email'
                                                className='form-control'
                                                type='email'
                                                name='email'
                                                placeholder='Email'
                                                required='required'
                                            />
                                        </div>
                                        <div className='mb-3'>
                                            <input
                                                id='password'
                                                className='form-control'
                                                type='password'
                                                name='password'
                                                placeholder='Password'
                                                required='required'
                                            />
                                        </div>
                                        <div className='mb-3'>
                                            <button
                                                className='btn btn-primary shadow d-block w-100'
                                                type='submit'
                                                disabled={this.state.loading}
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                        <p className='text-muted'>
                                            Already have an account?&nbsp;
                                            <Link to='/signin'>Sign In</Link>
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        );
    }
}

export default Signup;