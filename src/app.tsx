import createHistory from 'history/createBrowserHistory';
import * as React from 'react';
import {Provider} from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter, routerMiddleware, routerReducer } from 'react-router-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import thunk from 'redux-thunk';

import {LoginView} from './views/login';
import {MeetupDetailsView} from './views/meetupDetails';
import {MeetupListView} from './views/meetupList';
import {RegisterView} from './views/register';

import { BaseMeetup, User} from './models';
import {authReducer} from './reducers/auth';
import {meetupReducer} from './reducers/meetups';

import {meetups} from './mockData';

const history = createHistory();

const router = routerMiddleware(history);

export const store = createStore(
  combineReducers({
    auth: authReducer,
    meetups : meetupReducer,
    router: routerReducer,
  }),
  applyMiddleware(router, thunk),
);

export class App extends React.PureComponent<{}, {}> {
    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Switch>
                        <Route exact path="/" component={RegisterView}></Route>
                        <Route exact path="/login/:hash" component={LoginView}></Route>
                        <Route exact path="/meetups" component={MeetupListView}></Route>
                        <Route exact path="/meetups/new" render={() => <span>New Meetup</span>}></Route>
                        <Route exact path="/meetups/:meetupId" component={MeetupDetailsView}></Route>
                        <Route render={() => <span>404</span>}></Route>
                    </Switch>
                </ConnectedRouter>
            </Provider>
        );
    }
}
