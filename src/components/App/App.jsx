import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Routes
} from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import Main from '../Main/Main';
import Signin from '../Signin/Signin';
import Signup from '../Signup/Signup.jsx';
import Navbar from '../Navbar/Navbar';
import Error404 from '../404/404.jsx';
import Test from '../Test/Test.jsx';

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
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100vh'
                            }}>
                                <h1>Nothing Here</h1>
                            </div>
                        </>
                    } />
                    <Route path='/meeting/:id' element={
                        <>
                            <Navbar session={this.state.session} />
                            <Main session={this.state.session} />
                        </>
                    }
                    />
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
                    <Route path='/test' element={
                        <>
                            <Navbar session={this.state.session} />
                            <Test session={this.state.session} />
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