import * as _ from 'lodash';
import { combineEpics, Epic } from 'redux-observable';
import {Observable} from 'rxjs';

// TODO: should be injected as a dependency through redux-observable
import * as backend from '../backend';
import * as models from '../models';

import actionCreatorFactory, {Action} from 'typescript-fsa';

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
}

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

const CreateMeetupRequest = actionCreator<MeetupDetailsPayload>('CREATE_MEETUP_REQUEST');
const CreateMeetupResponse = actionCreator<MeetupDetailsPayload | Error>('CREATE_MEETUP_RESPONSE');
const createMeetupEpic: Epic<Action<any>, MeetupsState> = (action$) => {
    return action$.ofType(CreateMeetupRequest.type)
        .mergeMap(async (action: Action<MeetupDetailsPayload>) => {
            try {
                const newMeetup = await backend.createMeetup(action.payload.meetup);
                return CreateMeetupResponse({meetup: newMeetup});
            } catch (err) {
                return CreateMeetupResponse(err);
            }
        });
};

const GetMeetupListRequest = actionCreator('GET_MEETUP_LIST_REQUEST');
function GetMeetupListRequestReducer(state: MeetupsState): MeetupsState {
    return _.merge({}, state, {
        list: {isLoading: true},
    });
}
const GetMeetupListResponse = actionCreator<MeetupListPayload | Error>('GET_MEETUP_LIST_REQUEST');
function GetMeetupListResponseReducer(state: MeetupsState, payload: MeetupListPayload | Error): MeetupsState {
    const nextState = _.cloneDeep(state);
    nextState.list.isLoading = false;
    if (isError(payload)) {
        nextState.list.errorMessage = payload.message;
    } else {
        nextState.list.allItems = payload.meetups;
    }
    return nextState;
}

const SetFilterString = actionCreator('SET_TEXT_FILTER');

const GetMeetupDetailsRequest = actionCreator<MeetupIdPayload>('GET_MEETUP_DETAILS_REQUEST');
const GetMeetupDetailsResponse = actionCreator<MeetupDetailsPayload | Error>('GET_MEETUP_DETAILS_RESPONSE');

const AddAtendeeRequest = actionCreator<AddUserPayload>('ADD_ATENDEE_REQUEST');
const AddAtendeeResponse = actionCreator<MeetupDetailsPayload | Error>('ADD_ATENDEE_RESPONSE');

const SetPresenterRequest = actionCreator<AddUserPayload>('SET_PRESENTER_REQUEST');
const SetPresenterResponse = actionCreator<MeetupDetailsPayload | Error>('SET_PRESENTER_RESPONSE');

const AddChatMessageRequest = actionCreator<AddChatPayload>('ADD_CHAT_MESSAGE_REQUEST');
const AddChatMessageResponse = actionCreator<MeetupDetailsPayload | Error>('ADD_CHAT_MESSAGE_RESPONSE');

