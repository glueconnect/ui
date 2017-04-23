import * as _ from 'lodash';
import { push } from 'react-router-redux'

import * as actions from './actions';
import * as models from './models';

import {meetups} from './mockdata';

const mockState: models.AppState = {
    user: null,
    authToken: null,
    meetups: meetups,
}

export default function reducer(state: models.AppState = mockState, action: actions.Action): models.AppState {
    switch (action.type) {
        case "LOGIN":
            return _.merge({}, state, {
                user: action.user,
                authToken: action.token,
            });
        case "LOGOUT":
            return _.merge({}, state, {
                user: null,
                authToken: "",
            });
        default:
            return state;
    }
}