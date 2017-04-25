import * as React from 'react';
import {Provider} from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Route, Switch } from 'react-router';
import { ConnectedRouter, routerReducer, routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory';

import {RegisterView} from './views/register'
import {LoginView} from './views/login'
import {MeetupListView} from './views/meetupList'
import {MeetupDetailsView} from './views/meetupDetails'

import {AppState, Meetup, User} from './models';
import {authReducer} from './reducers/auth';

import {meetups} from './mockData';

const history = createHistory()

const router = routerMiddleware(history)

export const store = createStore(
  combineReducers({
    auth: authReducer,
    meetups : (state: Meetup[] = meetups) => state,
    router: routerReducer
  }),
  applyMiddleware(router, thunk)
)


export class App extends React.PureComponent<{}, {}> {
    constructor(props: {}) {
        super(props);
    }

    public render() {
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
        )
    }
}

/**
 * Structure:
 * 
 */