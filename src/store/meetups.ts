import * as _ from 'lodash';
import { combineEpics, Epic } from 'redux-observable';

// TODO: should be injected as a dependency through redux-observable
import * as backend from '../backend';
import * as models from '../models';

import actionCreatorFactory, {Action, AnyAction} from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

const actionCreator = actionCreatorFactory('MEETUPS');

function isError(x: any): x is Error {
    return x instanceof Error;
}

/**
 * State
 */
export interface MeetupsState {
    list: {
        isLoading: boolean;
        errorMessage: string;
        // unfiltered data:
        allItems: models.BaseMeetup[];
        // filtered data:
        items: models.BaseMeetup[];
        filter: string;
    };
    details: {
        isLoading: boolean;
        errorMessage: string;
        meetup: models.BaseMeetup;
    };
    new: {
        isLoading: boolean;
        errorMessage: string;
    };
}
const initialState: MeetupsState = {
    list: {
        isLoading: false,
        errorMessage: '',
        // unfiltered data:
        allItems: [],
        // filtered data:
        items: [],
        filter: '',
    },
    details: {
        isLoading: false,
        errorMessage: '',
        meetup: null,
    },
    new: {
        isLoading: false,
        errorMessage: '',
    },
};

/**
 * Actions
 */
interface MeetupDetailsPayload {
    meetup: models.MeetupDetails;
}

interface MeetupListPayload {
    meetups: models.BaseMeetup[];
}

interface MeetupIdPayload {
    meetupId: models.BaseMeetup['id'];
}

interface AddUserPayload {
    meetupId: models.BaseMeetup['id'];
    user: models.User;
}

interface AddChatPayload {
    meetupId: models.BaseMeetup['id'];
    message: models.Message;
}

interface FilterTextpayload {
    filter: string;
}

// Create new meetup
const CreateMeetupRequest = actionCreator<MeetupDetailsPayload>('CREATE_MEETUP_REQUEST');
const CreateMeetupResponse = actionCreator<MeetupDetailsPayload | Error>('CREATE_MEETUP_RESPONSE');
function createMeetupRequestReducer(state: MeetupsState) {
    return _.merge({}, state, {
        new: {
            isLoading: false,
            errorMessage: '',
        },
    });
}
function createMeetupResponseReducer(state: MeetupsState, payload: MeetupDetailsPayload | Error) {
    return _.merge({}, state, {
        new: {
            isLoading: false,
            errorMessage: isError(payload) ? payload.message : '',
        },
    });
}
const createMeetupEpic: Epic<AnyAction, MeetupsState> = (action$) => {
    return action$.ofType(CreateMeetupRequest.type)
        .mergeMap(async (action: Action<MeetupDetailsPayload>) => {
            return backend.createMeetup(action.payload.meetup)
                .then((meetup) => ({meetup}))
                .then(CreateMeetupRequest, CreateMeetupResponse);
        });
};

export const GetMeetupListRequest = actionCreator('GET_MEETUP_LIST_REQUEST');
const GetMeetupListResponse = actionCreator<MeetupListPayload | Error>('GET_MEETUP_LIST_RESPONSE');
function getMeetupListRequestReducer(state: MeetupsState): MeetupsState {
    return _.merge({}, state, {
        list: {
            isLoading: true,
            errorMessage : '',
        },
    });
}
function getMeetupListResponseReducer(state: MeetupsState, payload: MeetupListPayload | Error): MeetupsState {
    return _.merge({}, state, {
        list: {
            isLoading: false,
            errorMessage: isError(payload) ? payload.message : '',
            allItems: isError(payload) ? state.list.allItems : payload.meetups,
        },
    });
}
const getMeetupListEpic: Epic<AnyAction, MeetupsState> = (action$) => {
    return action$.ofType(GetMeetupListRequest.type)
        .mergeMap((action: Action<{}>) => {
            return backend.getMeetupList()
                .then((meetups) => ({meetups}))
                .then(GetMeetupListResponse, GetMeetupListResponse);
        });
};

const SetFilterString = actionCreator<FilterTextpayload>('SET_TEXT_FILTER');
function setFilterStringReducer(state: MeetupsState, payload: FilterTextpayload) {
    return _.merge({}, state, {
        list: {
            filter: payload.filter,
        },
    });
}

const GetMeetupDetailsRequest = actionCreator<MeetupIdPayload>('GET_MEETUP_DETAILS_REQUEST');
const GetMeetupDetailsResponse = actionCreator<MeetupDetailsPayload | Error>('GET_MEETUP_DETAILS_RESPONSE');

const AddAtendeeRequest = actionCreator<AddUserPayload>('ADD_ATENDEE_REQUEST');
const AddAtendeeResponse = actionCreator<MeetupDetailsPayload | Error>('ADD_ATENDEE_RESPONSE');

const SetPresenterRequest = actionCreator<AddUserPayload>('SET_PRESENTER_REQUEST');
const SetPresenterResponse = actionCreator<MeetupDetailsPayload | Error>('SET_PRESENTER_RESPONSE');

const AddChatMessageRequest = actionCreator<AddChatPayload>('ADD_CHAT_MESSAGE_REQUEST');
const AddChatMessageResponse = actionCreator<MeetupDetailsPayload | Error>('ADD_CHAT_MESSAGE_RESPONSE');

// const loggingEpic: Epic<AnyAction, MeetupsState> = (action$) => {
//     return action$.forEach(console.log);
// };
export const meetupEpics = combineEpics(createMeetupEpic, getMeetupListEpic);
export const meetupReducer = reducerWithInitialState(initialState)
    .case(CreateMeetupRequest, createMeetupRequestReducer)
    .case(CreateMeetupResponse, createMeetupResponseReducer)
    .case(GetMeetupListRequest, getMeetupListRequestReducer)
    .case(GetMeetupListResponse, getMeetupListResponseReducer);
