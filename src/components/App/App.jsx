import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Routes
} from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Home from '../Home/Home';
import Main from '../Main/Main';
import Signin from '../Signin/Signin';
import Signup from '../Signup/Signup';
import Profile from '../Profile/Profile';
import Navbar from '../Navbar/Navbar';
import Error404 from '../404/404';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            session: supabase.auth.session(),
        };
    }

    componentDidMount() {
        supabase.auth.onAuthStateChange((_event, session) => this.setState({ session }));
    }

    render() {
        return (
            <Router>
                <Routes>
                    <Route path='/' element={
                        <>
                            <Navbar session={this.state.session} />
                            <Home session={this.state.session} />
                        </>
                    } />
                    <Route path='/meeting/:id' element={
                        <>
                            <Navbar session={this.state.session} />
                            <Main session={this.state.session} />
                        </>
                    }
                    />
                    <Route path="/profile" element={
                        <>
                            <Navbar session={this.state.session} />
                            <Profile session={this.state.session} />
                        </>
                    } />
                    <Route path='/signin' element={
                        <>
                            <Navbar session={this.state.session} />
                            <Signin session={this.state.session} />
                        </>
                    } />
                    <Route path='/signup' element={
                        <>
                            <Navbar session={this.state.session} />
                            <Signup session={this.state.session} />
                        </>
                    } />
                    <Route path='*' element={
                        <>
                            <Navbar session={this.state.session} />
                            <Error404 />
                        </>
                    } />
                </Routes>
            </Router>
        );
    }
}

export default App;