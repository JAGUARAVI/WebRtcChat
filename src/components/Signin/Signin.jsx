import React from 'react';
import {
    useSearchParams,
    Navigate,
    Link,
} from 'react-router-dom';
import { supabase } from '../../supabaseClient.js'

const withParams = (props) => {
    return (props) => <Signin {...props} params={useSearchParams()} />;
}

class Signin extends React.Component {
    constructor(props) {
        super(props);

        const signup = this.props.params[0].get('signup');
        const message = signup == null ? '' : signup == 'true' ? 'Sign Up Successful.\nPlease Confirm your Email and then Sign In.' : 'You are alredy Signed Up\nPlease Sign In.';

        this.state = {
            error: '',
            message
        };

    }

    handleSubmit(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        supabase.auth.signIn({
            email, password
        }).then(({ user, error }) => {
            if (error) this.setState({ error: error.message });
        }).catch((error) => {
            this.setState({ error: error.message });
        });
    }

    render() {
        return this.props.session ? (<Navigate to={-1} replace={true} />) : (
            <section className="py-5 mt-5">
                <div className="container py-5">
                    <div className="row mb-4 mb-lg-5">
                        <div className="col-md-8 col-xl-6 text-center mx-auto">
                            <p className="fw-bold text-success mb-2">Sign In</p>
                            <h2 className="fw-bold">Welcome back</h2>
                        </div>
                    </div>
                    <div className="row d-flex justify-content-center">
                        <div className="col-md-6 col-xl-4">
                            <div className="card">
                                <div className="card-body text-center d-flex flex-column align-items-center">
                                    <div className="bs-icon-xl bs-icon-circle bs-icon-primary shadow bs-icon my-4">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="1em"
                                            height="1em"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                            className="bi bi-person"
                                        >
                                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"></path>
                                        </svg>
                                    </div>
                                    <form id="signIn" onSubmit={this.handleSubmit.bind(this)}>
                                        {
                                            this.state.error ? (
                                                <div className="alert alert-danger w-100" role="alert">
                                                    {this.state.error}
                                                </div>
                                            ) : this.state.message ? (
                                                <div className="alert alert-success w-100" role="alert">
                                                    {this.state.message.split('\n').map((item, key) => <><span key={key}>{item}</span><br /></>)}
                                                </div>
                                            ) : null
                                        }
                                        <div className="mb-3">
                                            <input
                                                id="email"
                                                className="form-control"
                                                type="email"
                                                name="email"
                                                placeholder="Email"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                id="password"
                                                className="form-control"
                                                type="password"
                                                name="password"
                                                placeholder="Password"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <button
                                                className="btn btn-primary shadow d-block w-100"
                                                type="submit"
                                            >
                                                Sign in
                                            </button>
                                        </div>
                                        <p className="text-muted">
                                            Dont have an account?&nbsp;
                                            <Link to="/signup">Sign Up</Link>
                                        </p>
                                        <p className="d-none text-muted">Forgot your password?</p>
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

export default withParams(Signin);