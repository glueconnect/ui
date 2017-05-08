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
            [pendingId: string]: {
                isFailed: boolean,
                message: models.Message,
            },
        };
        pendingAttendee: boolean;
        pendingPresenter: boolean;
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
        pendingAttendee: false,
        pendingPresenter: false,
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
            stateChanges.pendingAttendee = false;
            stateChanges.pendingPresenter = false;
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

export const AddAttendee = actionCreator<AddUserPayload>('ADD_ATENDEE');
const AddAttendeeSuccess = actionCreator<MeetupDetailsPayload>('ADD_ATENDEE_SUCCESS');
const AddAttendeeFailure = actionCreator<Error>('ADD_ATENDEE_FAILURE');

// let id = 0;
reducer.case(AddAttendee, (state, payload) => {
    return {
        ...state,
        details: {
            ...state.details,
            pendingAttendee: true,
        },
    };
});
reducer.case(AddAttendeeSuccess, (state, payload) => {
    return {
        ...state,
        details: {
            ...state.details,
            meetup: payload.meetup,
            pendingAttendee: false,
        },
    };
});
reducer.case(AddAttendeeFailure, (state, payload) => {
    return {
        ...state,
        details: {
            ...state.details,
            errorMessage: payload.message,
            pendingAttendee: false,
        },
    };
});
epics.push((action$) => {
    return action$.ofType(AddAttendee.type)
        .mergeMap((action: Action<AddUserPayload>) => {
            const {meetupId, user} = action.payload;

            return (async () => {
                try {
                    const meetup = await backend.addAttendee(meetupId, user);
                    return AddAttendeeSuccess({meetup});
                } catch (err) {
                    return AddAttendeeFailure(err);
                }
            })();
        });
});

export const AddPresenter = actionCreator<AddUserPayload>('ADD_PRESENTER');
const AddPresenterSuccess = actionCreator<MeetupDetailsPayload>('ADD_PRESENTER_SUCCESS');
const AddPresenterFailure = actionCreator<Error>('ADD_PRESENTER_FAILURE');
reducer.case(AddPresenter, (state, payload) => {
    return {
        ...state,
        details: {
            ...state.details,
            pendingPresenter: true,
        },
    };
});
reducer.case(AddPresenterSuccess, (state, payload) => {
    return {
        ...state,
        details: {
            ...state.details,
            meetup: payload.meetup,
            pendingPresenter: false,
        },
    };
});
reducer.case(AddPresenterFailure, (state, payload) => {
    return {
        ...state,
        details: {
            ...state.details,
            errorMessage: payload.message,
            pendingPresenter: false,
        },
    };
});
epics.push(($action) => {
    return $action.ofType(AddPresenter.type)
        .mergeMap(async (action: Action<AddUserPayload>) => {
            const {meetupId, user} = action.payload;

            try {
                const meetup = await backend.setPresenter(meetupId, user);
                return AddPresenterSuccess({meetup});
            } catch (err) {
                return AddPresenterFailure(err);
            }
        });
});


// type AddPendingChatRequest = AddChatPayload & PendingIdPayload;
// type AddPendingChatSuccess = AddChatPayload & PendingIdPayload;
// type AddPendingChatFailure = AddChatPayload & PendingIdPayload;
// export const AddChatMessage = actionCreator<AddChatPayload>('ADD_CHAT_MESSAGE');
// export const AddChatMessageRequest = actionCreator<AddChatPayload>('ADD_CHAT_MESSAGE_REQUEST');
// const AddChatMessageSuccess = actionCreator<AddPendingChatMessage>('ADD_CHAT_MESSAGE_SUCCESS');
// const AddChatMessageFailure = actionCreator<MeetupDetailsPayload | Error>('ADD_CHAT_MESSAGE_FAILURE');

type AddPendingChatPayload = AddChatPayload & PendingIdPayload;
type AddPendingChatSuccessPayload = MeetupDetailsPayload & PendingIdPayload;
type AddPendingChaFailurePayload = Error & PendingIdPayload;
export const AddChat = actionCreator<AddChatPayload>('ADD_CHAT');
export const AddPendingChat = actionCreator<AddPendingChatPayload>('ADD_PENDING_CHAT');
const AddPendingChatSuccess = actionCreator<AddPendingChatSuccessPayload>('ADD_PENDING_CHAT_SUCCESS');
const AddPendingChatFailure = actionCreator<AddPendingChaFailurePayload>('ADD_PENDING_CHAT_FAILURE');
reducer.case(AddPendingChat, (state, payload) => {
    return {
        ...state,
        details : {
            ...state.details,
            pendingChat : {
                ...state.details.pendingChat,
                [payload.pendingId] : {
                    isFailed: false,
                    message: payload.message,
                },
            },
        },
    };
});
reducer.case(AddPendingChatSuccess, (state, payload) => {
    const pendingChat = _.clone(state.details.pendingChat);
    delete pendingChat[payload.pendingId];

    return {
        ...state,
        details : {
            ...state.details,
            meetup: payload.meetup,
            pendingChat,
        },
    };
});
reducer.case(AddPendingChatFailure, (state, payload) => {
    return {
        ...state,
        details : {
            ...state.details,
            pendingChat : {
                ...state.details.pendingChat,
                [payload.pendingId] : {
                    ...state.details.pendingChat[payload.pendingId],
                    isFailed: true,
                },
            },
        },
    };
});
let id = 0;
epics.push(($action) => {
    return $action.ofType(AddChat.type)
        .mergeMap((action: Action<AddChatPayload>) => {
            const pendingId = `${id++}`;
            const {meetupId, message} = action.payload;

            const request = Observable.of(AddPendingChat({meetupId, message, pendingId}));

            const response = backend.addChatMessage(meetupId, message)
                .then((meetup) => {
                    return AddPendingChatSuccess({meetup, pendingId});
                }).catch((err) => {
                    return AddPendingChatFailure(_.extend(err, {pendingId}));
                });

            return Observable.merge(request, response);
        });
});

export const meetupReducer = reducer.build();
export const meetupEpics = combineEpics(...epics);
