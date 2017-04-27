import createHistory from 'history/createBrowserHistory';
import { routerMiddleware, routerReducer, RouterState } from 'react-router-redux';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';

import {authReducer, AuthState} from './auth';
import {meetupEpics, meetupReducer,  MeetupsState} from './meetups';

export const history = createHistory();
const router = routerMiddleware(history);

const epics = combineEpics(meetupEpics);
const epicMiddleware = createEpicMiddleware(epics);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export interface RootState {
  auth: AuthState;
  meetups: MeetupsState;
  router: RouterState;
}

export const store = createStore<RootState>(
  combineReducers<RootState>({
    auth: authReducer,
    meetups : meetupReducer,
    router: routerReducer,
  }),
  composeEnhancers(applyMiddleware(router, epicMiddleware)),
);
