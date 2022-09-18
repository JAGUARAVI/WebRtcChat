import React from 'react';
import { supabase } from '../../supabaseClient';
import { Navigate } from 'react-router-dom';

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            message: '',
            type: '',
        }

        this.avatarExists = true;
        this.avatar = this.props.session ?
            supabase.storage
                .from('avatars')
                .getPublicUrl(`${supabase.auth.user().id}.png`)
                .publicURL + '?cache=' + Date.now()
            : null;

        this.replacement = supabase.storage
            .from('avatars')
            .getPublicUrl('default.png')
            .publicURL;
    }

    async handleDetails(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;

        const { error } = await supabase.auth.update({
            data: {
                username: username,
            }
        });

        if (error) {
            this.setState({
                message: error.message,
                type: 'danger',
            });
        } else {
            this.setState({
                message: 'Details updated!',
                type: 'success',
            });
        }
    }

    async handleAvatar(event) {
        event.preventDefault();

        const selectedFile = document.getElementById('avatarUpload').files[0];

        document.getElementById('closeModal').click();

        if (!selectedFile.type.startsWith('image/')) {
            return this.setState({
                message: 'File is not an image.\nOnly images are allowed.',
                type: 'danger'
            });
        }

        if (selectedFile.size > 1500000) {
            alert(`Max file size is 1.5MB! Your file is of ${(selectedFile.size / 1000000).toFixed(2)}MB.`);
            return this.setState({
                message: `Max file size is 1.5MB! Your file is of ${(selectedFile.size / 1000000).toFixed(2)}MB.`,
                type: 'danger'
            });
        }

        const { data, error } = await supabase.storage
            .from('avatars').upload(`${supabase.auth.user().id}.png`, selectedFile, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) this.setState({
            message: error.message,
            type: 'danger',
        });
        else this.setState({
            message: 'Avatar updated!',
            type: 'success',
        });
    }

    render() {
        const user = supabase.auth.user();

        return !user ? (<Navigate to={'/signin'} />) : (
            <>
                <section>
                    <div className="container">
                        <div className="row m-4">
                            <div className="col-12 text-center mb-4">
                                <h1>Profile</h1>
                            </div>
                            <div className="col-auto col-sm-12 col-md-4 mb-4">
                                <div
                                    className="card"
                                    style={{ boxShadow: "0px 0px 20px rgba(0,0,0,0.25)" }}
                                >
                                    <div className="card-body text-center">
                                        <img
                                            id=""
                                            className="rounded-circle img-fluid d-inline-flex p-3"
                                            style={{ width: "100%", maxWidth: 300, aspectRatio: 1 }}
                                            src={this.avatar}
                                            onError={(e) => {
                                                e.preventDefault();
                                                this.avatarExists = false;
                                                e.target.src = this.replacement;
                                            }}
                                        />
                                        <button
                                            className="btn btn-outline-primary"
                                            type="button"
                                            data-bs-target="#modal-1"
                                            data-bs-toggle="modal"
                                        >
                                            <i className="fas fa-edit" />
                                            &nbsp; Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-auto col-sm-12 col-md-8">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <div
                                            className="card"
                                            style={{ boxShadow: "0px 0px 20px rgba(0,0,0,0.25)" }}
                                        >
                                            <div className="card-body">
                                                <h4 className="card-title">Details</h4>
                                                <form onSubmit={this.handleDetails.bind(this)}>
                                                    {
                                                        this.state.message.length > 0 ? (
                                                            <div className={`alert alert-${this.state.type} w-100`} role="alert">
                                                                {this.state.message}
                                                            </div>
                                                        ) : null
                                                    }
                                                    <div className="mb-2">
                                                        <label className="form-label">Username</label>
                                                        <input
                                                            id="username"
                                                            className="form-control form-control-sm"
                                                            type="text"
                                                            autoFocus=""
                                                            defaultValue={user.user_metadata.username}
                                                        />
                                                        <small className="form-text">
                                                            This will be your default name when joining meetings.
                                                        </small>
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="form-label">Email</label>
                                                        <input
                                                            id="email"
                                                            className="form-control form-control-sm"
                                                            type="email"
                                                            inputMode="email"
                                                            value={user.email}
                                                            disabled={true}
                                                        />
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="form-label">Password</label>
                                                        <button
                                                            className="btn btn-light btn-sm d-block w-100"
                                                            type="button"
                                                            disabled={true}
                                                        >
                                                            Change Password
                                                        </button>
                                                    </div>
                                                    <div className="text-start mt-2">
                                                        <button className="btn btn-outline-primary" type="submit">
                                                            <i className="fas fa-save" />
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
                    className="modal fade text-dark"
                    role="dialog"
                    tabIndex={-1}
                    id="modal-1"
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-centered modal-fullscreen-md-down"
                        role="document"
                    >
                        <div className="modal-content">
                            <form id="avatarForm" onSubmit={this.handleAvatar.bind(this)} encType="multipart/form-data">
                                <div className="modal-header">
                                    <h4 className="modal-title">Change Avatar</h4>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    />
                                </div>
                                <div className="modal-body">
                                    <p>Upload your new Avatar</p>
                                    <input
                                        id="avatarUpload"
                                        className="form-control"
                                        type="file"
                                        data-bs-toggle="tooltip"
                                        data-bss-tooltip=""
                                        required={true}
                                        accept="image/*"
                                        name="avatar"
                                        title="Max File SIze: 1MB"
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-light"
                                        type="button"
                                        data-bs-dismiss="modal"
                                        id="closeModal"
                                    >
                                        Cancel
                                    </button>
                                    <button className="btn btn-outline-primary" type="submit">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>);
    }
}

export default Profile;