import * as _ from 'lodash';
import { combineEpics, Epic } from 'redux-observable';
import { ThunkAction } from 'redux-thunk';
import { Observable } from 'rxjs';

import { meetups, users } from '../mockdata';
import * as models from '../models';

const STORAGE_KEY = 'AUTH_TOKEN';

export interface Login {
    type: 'LOGIN';
    payload: {
        token: string;
    };
}

export interface LoginSuccess {
    type: 'LOGIN_SUCCESS';
    payload: {
        token: string;
        user: models.User;
    };
}

export interface Logout {
    type: 'LOGOUT';
}

export interface LogoutSuccess {
    type: 'LOGOUT_SUCCESS';
}

export const loginSuccess = (token: string, user: models.User): LoginSuccess => {
    return {
        type: 'LOGIN_SUCCESS',
        payload: {
            token,
            user,
        },
    };
};

// Actions first flow through reducer then epics
export type AuthActions = Login | LoginSuccess | Logout | LogoutSuccess;

function validateToken(token: string): Promise<models.User> {
    return new Promise((resolve, reject) => {
        const user = _.find(users, (u) => _.startsWith(u.email, token));
        if (user == null) {
            return reject('Where did you get this hash?');
        }
        return resolve(user);
    });
}

const loginEpic: Epic<AuthActions, AuthState> = (action$) => {
    return action$.ofType('LOGIN')
        // mergeMap emits the results of a promise
        // async functions always return a promise, so this works
        .mergeMap(async (action: Login) => {
            try {
                const { token } = action.payload;
                const user = await validateToken(token);
                localStorage.setItem(STORAGE_KEY, token);
                return loginSuccess(token, user);
            } catch (e) {
                // this is where you should emit some type of login failure action
                console.error('what is error handling??', e);
            }
        });
};

const logoutEpic: Epic<AuthActions, AuthState> = (action$) => {
    return action$.ofType('LOGOUT')
        // nothing async going on here yet
        .do(() => {
            localStorage.removeItem(STORAGE_KEY);
        })
        .mapTo<undefined, LogoutSuccess>({
            type: 'LOGOUT_SUCCESS',
        });
};

export const authEpics = combineEpics(loginEpic, logoutEpic);

export interface AuthState {
    token: string;
    user: models.User;
}

const initialState: AuthState = {
    token: localStorage.getItem(STORAGE_KEY) || '',
    user: null,
};

export function authReducer(state: AuthState = initialState, action: AuthActions): AuthState {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return _.merge({}, state, {
                user: action.payload.user,
                authToken: action.payload.token,
            });
        case 'LOGOUT_SUCCESS':
            return _.merge({}, state, {
                user: null,
                authToken: '',
            });
        default:
            return state;
    }
}

