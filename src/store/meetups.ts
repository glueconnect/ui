import * as _ from 'lodash';
import { combineEpics, Epic } from 'redux-observable';
import { Observable } from 'rxjs';

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
        meetup: models.MeetupDetails;
        pendingChat: {
            [pendingId: string]: models.Message,
        };
        pendingAttendees: {
            [pendingId: string]: models.User,
        };
    };
    new: {
        isLoading: boolean;
        errorMessage: string;
    };
}
const initialState: MeetupsState = {
    list: {
        isLoading: true,
        errorMessage: '',
        // unfiltered data:
        allItems: [],
        // filtered data:
        items: [],
        filter: '',
    },
    details: {
        isLoading: true,
        errorMessage: '',
        meetup: null,
        pendingAttendees: {},
        pendingChat: {},
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

interface PendingIdPayload {
    pendingId: string;
}

interface AddChatPayload {
    meetupId: models.BaseMeetup['id'];
    message: models.Message;
}

interface FilterTextpayload {
    filter: string;
}

function filteredItems(allItems: models.BaseMeetup[], filter: string) {
    return allItems.filter((meetup) => {
        return _.includes(meetup.title, filter) || _.includes(meetup.description, filter) ;
    });
}

const reducer = reducerWithInitialState(initialState);
const epics: Array<Epic<AnyAction, MeetupsState>> = [];

// Create new meetup
export const CreateMeetupRequest = actionCreator<MeetupDetailsPayload>('CREATE_MEETUP_REQUEST');
const CreateMeetupResponse = actionCreator<MeetupDetailsPayload | Error>('CREATE_MEETUP_RESPONSE');
reducer.case(CreateMeetupRequest, (state) => {
    return {
        ...state,
        new: {
            isLoading: false,
            errorMessage: '',
        },
    };
});
reducer.case(CreateMeetupResponse, (state, payload) => {
    return {
        ...state,
        new: {
            isLoading: false,
            errorMessage: isError(payload) ? payload.message : '',
        },
    };
});
epics.push((action$) => {
    return action$.ofType(CreateMeetupRequest.type)
        .mergeMap(async (action: Action<MeetupDetailsPayload>) => {
            return backend.createMeetup(action.payload.meetup)
                .then((meetup) => ({meetup}))
                .then(CreateMeetupRequest, CreateMeetupResponse);
        });
});

export const GetMeetupListRequest = actionCreator('GET_MEETUP_LIST_REQUEST');
const GetMeetupListResponse = actionCreator<MeetupListPayload | Error>('GET_MEETUP_LIST_RESPONSE');
reducer.case(GetMeetupListRequest, (state) => {
    return {
        ...state,
        list : {
            ...state.list,
            isLoading: true,
            errorMessage : '',
        },
    };
});
reducer.case(GetMeetupListResponse, (state, payload) => {
    const stateChanges = isError(payload) ? {
            errorMessage: payload.message,
        } : {
            errorMessage: '',
            allItems: payload.meetups,
            items: filteredItems(payload.meetups, state.list.filter),
        };

    return {
        ...state,
        list : {
            ...state.list,
            isLoading: true,
            ...stateChanges,
        },
    };
});
epics.push((action$) => {
    return action$.ofType(GetMeetupListRequest.type)
        .mergeMap((action: Action<{}>) => {
            return backend.getMeetupList()
                .then((meetups) => ({meetups}))
                .then(GetMeetupListResponse, GetMeetupListResponse);
        });
});

export const SetFilterString = actionCreator<FilterTextpayload>('SET_TEXT_FILTER');
reducer.case(SetFilterString, (state, payload) => {
    return {
        ...state,
        list : {
            ...state.list,
            filter: payload.filter,
            items : filteredItems(state.list.allItems, payload.filter),
        },
    };
});

export const GetMeetupDetailsRequest = actionCreator<MeetupIdPayload>('GET_MEETUP_DETAILS_REQUEST');
const GetMeetupDetailsResponse = actionCreator<MeetupDetailsPayload | Error>('GET_MEETUP_DETAILS_RESPONSE');
reducer.case(GetMeetupDetailsRequest, (state, payload) => {
    return {
        ...state,
        details : {
            ...state.details,
            isLoading: true,
        },
    };
});
reducer.case(GetMeetupDetailsResponse, (state, payload) => {
    let stateChanges: Partial<MeetupsState['details']>;
    if (isError(payload)) {
        stateChanges = {
            errorMessage: payload.message,
        };
    } else {
        stateChanges = {
            errorMessage: '',
            meetup: payload.meetup,
        };
        const newMeetup = state.details.meetup == null ||
            state.details.meetup.id !== payload.meetup.id;

        if (newMeetup) {
            stateChanges.pendingAttendees = {};
            stateChanges.pendingChat = {};
        }
    }

    return {
        ...state,
        details : {
            ...state.details,
            isLoading: false,
            ...stateChanges,
        },
    };
});
epics.push((action$) => {
    return action$.ofType(GetMeetupDetailsRequest.type)
        .mergeMap((action: Action<MeetupIdPayload>) => {
            return backend.getMeetupDetails(action.payload.meetupId)
                .then((meetup) => ({meetup}))
                .then(GetMeetupDetailsResponse, GetMeetupDetailsResponse);
        });
});

type AddPendingUserPayload = AddUserPayload & PendingIdPayload;
type AddPendingUserSuccess = MeetupDetailsPayload & PendingIdPayload;
type AddPendingUserFailure = Error & PendingIdPayload;
export const AddAttendee = actionCreator<AddUserPayload>('ADD_ATENDEE');
const AddAttendeeRequest = actionCreator<AddPendingUserPayload>('ADD_ATENDEE_REQUEST');
const AddAttendeeSuccess = actionCreator<AddPendingUserSuccess>('ADD_ATENDEE_SUCCESS');
const AddAttendeeFailure = actionCreator<AddPendingUserFailure>('ADD_ATENDEE_FAILURE');

let id = 0;
epics.push((action$) => {
    return action$.ofType(AddAttendee.type)
        .mergeMap((action: Action<AddUserPayload>) => {
            const {payload} = action;
            const pendingId = `${id++}`;

            const request = Observable.of(AddAttendeeRequest({
                ...payload,
                pendingId,
            }));

            const response = (async () => {
                try {
                    const meetup = await backend.addAttendee(payload.meetupId, payload.user);
                    return AddAttendeeSuccess({meetup, pendingId});
                } catch (err) {
                    return AddAttendeeFailure(_.extend(err, {pendingId}));
                }
            })();

            return Observable.merge(request, response);
        });
});
reducer.case(AddAttendeeRequest, (state, payload) => {
    return {
        ...state,
        details: {
            ...state.details,
            pendingAttendees: {
                ...state.details.pendingAttendees,
                [payload.pendingId]: payload.user,
            },
        },
    };
});
reducer.case(AddAttendeeSuccess, (state, payload) => {
    const pendingAttendees = _.clone(state.details.pendingAttendees);
    delete pendingAttendees[payload.pendingId];

    return {
        ...state,
        details: {
            ...state.details,
            meetup: payload.meetup,
            pendingAttendees,
        },
    };
});
reducer.case(AddAttendeeFailure, (state, payload) => {
    const pendingAttendees = _.clone(state.details.pendingAttendees);
    delete pendingAttendees[payload.pendingId];

    return {
        ...state,
        details: {
            ...state.details,
            errorMessage: payload.message,
            pendingAttendees,
        },
    };
});


export const SetPresenterRequest = actionCreator<AddUserPayload>('SET_PRESENTER_REQUEST');
const SetPresenterResponse = actionCreator<MeetupDetailsPayload | Error>('SET_PRESENTER_RESPONSE');
reducer.case(SetPresenterRequest, (state, payload) => {
    return {
        ...state,
    };
});
reducer.case(SetPresenterResponse, (state, payload) => {
    return {
        ...state,
    };
});

export const AddChatMessageRequest = actionCreator<AddChatPayload>('ADD_CHAT_MESSAGE_REQUEST');
const AddChatMessageResponse = actionCreator<MeetupDetailsPayload | Error>('ADD_CHAT_MESSAGE_RESPONSE');
reducer.case(AddChatMessageRequest, (state, payload) => {
    return {
        ...state,
    };
});
reducer.case(AddChatMessageResponse, (state, payload) => {
    return {
        ...state,
    };
});

export const meetupReducer = reducer.build();
export const meetupEpics = combineEpics(...epics);
