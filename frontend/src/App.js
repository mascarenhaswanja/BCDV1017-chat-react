import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';
import Rooms from './pages/Rooms';
import Chat from './pages/Chat';
import SomethingWentWrong from './pages/Error';

import { isAuth } from './auth';

const PrivateRoute = ({ component: Component, ...remaing }) => (
  <Route
    {...remaing}
    render={props =>
      isAuth() ?
        (
          <Component {...props} />
        ) : (
          <Redirect to='/somethingWentWrong' />
        )
    }
  />
);

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact component={Login} />
        <Route path='/index' exact component={Login} />
        <Route path='/login' exact component={Login} />
        <Route path='/admin/login' component={AdminLogin} />
        <Route path='/admin' component={Admin} />
        <Route path='/rooms' component={Rooms} />
        <Route path='/chat/:roomId' component={Chat} />
        <Route path='/somethingWentWrong' component={SomethingWentWrong} />
        <Route component={SomethingWentWrong} />
      </Switch>
    </BrowserRouter>
  );
}