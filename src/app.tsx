import * as React from 'react';
import {Provider} from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';

// import thunk from 'redux-thunk';

import {LoginView} from './views/login';
import {MeetupDetailsView} from './views/meetupDetails';
import {MeetupListView} from './views/meetupList';
import {RegisterView} from './views/register';

import {history, store} from './store';

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
