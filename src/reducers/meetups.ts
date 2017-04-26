import * as _ from 'lodash';
import {ThunkAction} from 'redux-thunk';

import * as models from '../models';

import {meetups} from '../mockdata';

export interface MeetupsState {
    meetups: {
        [meetupId: string]: models.Meetup,
    };
    page: number;
    filter: string;
}

interface NewMeetup {
    type: 'NEW_MEETUP';
    meetup: models.Meetup;
}
export function createMeetup(meetup: models.Meetup): ThunkAction<Promise<NewMeetup>, MeetupsState, void> {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            resolve(dispatch({
                type: 'NEW_MEETUP',
                meetup,
            }));
        }).then(() => {
            // TODO: not sure if I want to do this?
            return dispatch(getMeetups());
        });
    };
}

interface GetMeetups {
    type: 'GET_MEETUPS';
    meetups: models.Meetup[];
}
export function getMeetups(): ThunkAction<Promise<{}>, MeetupsState, void> {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            return resolve(dispatch({
                type: 'GET_MEETUPS',
                meetups,
            }));
        });
    };
}

interface AddPresenter {
    type: 'ADD_PRESENTER';
    meetupId: models.Meetup['id'];
    presenter: models.User;
}
export function addPresenter(meetupId: AddPresenter['meetupId'], presenter: AddPresenter['presenter']): ThunkAction<Promise<{}>, MeetupsState, void> {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            return resolve(dispatch({
                type: 'ADD_PRESENTER',
                meetupId,
                presenter,
            }));
        });
    };
}

interface AddAttendee {
    type: 'ADD_ATTENDEE';
    meetupId: models.Meetup['id'];
    attendee: models.User;
}
export function addAttendee(meetupId: AddAttendee['meetupId'], attendee: AddAttendee['attendee']): ThunkAction<Promise<{}>, MeetupsState, void> {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            return resolve(dispatch({
                type: 'ADD_ATTENDEE',
                meetupId,
                attendee,
            }));
        });
    };
}

interface AddChatMessage {
    type: 'ADD_CHAT_MESSAGE';
    meetupId: models.Meetup['id'];
    message: models.Message;
}
export function addChatMessage(meetupId: AddChatMessage['meetupId'], message: AddChatMessage['message']): ThunkAction<Promise<{}>, MeetupsState, void> {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            return resolve(dispatch({
                type: 'ADD_CHAT_MESSAGE',
                meetupId,
                message,
            }));
        });
    };
}

export type MEETUP_ACTIONS = NewMeetup | GetMeetups | AddPresenter | AddAttendee | AddChatMessage;

const initialState: MeetupsState = {
    page: 0,
    filter : '',
    meetups,
};

export function meetupReducer(state: MeetupsState = initialState, action: MEETUP_ACTIONS): MeetupsState {
    switch (action.type) {
        case 'NEW_MEETUP' :
            return (() => {
                const nextState = _.cloneDeep(state);
                nextState.meetups[action.meetup.id] = action.meetup;
                return nextState;
            })();
        case 'GET_MEETUPS' :
            return _.merge({}, state, {
                meetups : action.meetups,
            });
        case 'ADD_PRESENTER' :
            return (() => {
                const nextState = _.cloneDeep(state);
                const meetup = state.meetups[action.meetupId];
                if (meetup != null) {
                    meetup.presenter = action.presenter;
                }
                return nextState;
            })();
        case 'ADD_ATTENDEE' :
            return (() => {
                const nextState = _.cloneDeep(state);
                const meetup = state.meetups[action.meetupId];
                if (meetup != null) {
                    meetup.attendees.push(action.attendee);
                }
                return nextState;
            })();
        case 'ADD_CHAT_MESSAGE' :
            return (() => {
                const nextState = _.cloneDeep(state);
                const meetup = state.meetups[action.meetupId];
                if (meetup != null) {
                    meetup.chat.push(action.message);
                }
                return nextState;
            })();
        default:
            return state;
    }
}
