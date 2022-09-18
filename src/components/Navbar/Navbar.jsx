
import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import './Navbar.css';

class Navbar extends React.Component {
    render() {
        const avatar = this.props.session ?
            supabase.storage
                .from('avatars')
                .getPublicUrl(`${supabase.auth.user().id}.png`)
                .publicURL
            : null;

        const replacement = supabase.storage
            .from('avatars')
            .getPublicUrl('default.png')
            .publicURL;

        return (
            <nav className='navbar navbar-dark navbar-expand-md fixed-top navbar-shrink py-3' id='mainNav'>
                <div className='container'>
                    <a className='navbar-brand d-flex align-items-center' href='/'>
                        <span className='bs-icon-xl bs-icon-circle bs-icon-black text-primary d-flex justify-content-center align-items-center me-2 bs-icon'>
                            <img style={{ height: '3rem', width: '3rem' }} src='/JaguarChat.svg' />
                        </span>
                        <span>Jaguar Chat</span>
                    </a>
                    <button data-bs-toggle='collapse' className='navbar-toggler' data-bs-target='#navcol-2'><span className='visually-hidden'>Toggle
                        navigation</span><span className='navbar-toggler-icon' /></button>
                    <div className='collapse navbar-collapse' id='navcol-2'>
                        <ul className='navbar-nav mx-auto'>
                            <li className='nav-item' />
                        </ul>
                        {
                            this.props.session ? (
                                <>
                                    <div className='dropdown no-arrow'>
                                        <a
                                            className='dropdown-toggle nav-link'
                                            aria-expanded='false'
                                            data-bs-toggle='dropdown'
                                            href='#'
                                        >
                                            <img
                                                id="avatar"
                                                alt="avatar"
                                                className="rounded-circle img-profile"
                                                src={avatar}
                                                style={{ aspectRatio: 1, maxHeight: "3rem", border: "none" }}
                                                onError={(e) => {
                                                    e.preventDefault();
                                                    e.target.src = replacement;
                                                }}
                                            />
                                            <span className='d-none d-lg-inline me-2 text-gray-600'>
                                                &nbsp; {supabase.auth.user().user_metadata.username}
                                            </span>
                                        </a>
                                        <div className='dropdown-menu shadow dropdown-menu-end animated--grow-in'>
                                            <Link className='dropdown-item' to={'/profile'}>
                                                <i className='fas fa-user fa-sm fa-fw me-2 text-gray-400' />
                                                &nbsp;Profile
                                            </Link>
                                            <div className='dropdown-divider' />
                                            <Link className='dropdown-item' onClick={() => supabase.auth.signOut()} to={'/'}>
                                                <i className='fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400' />
                                                &nbsp;Sign Out
                                            </Link>
                                        </div>
                                    </div>

                                </>
                            ) : (
                                <Link className='btn btn-outline-primary shadow' role='button' to='/signin'>Sign In</Link>
                            )
                        }
                    </div>
                </div>
            </nav>)
    }

}

export default Navbar;