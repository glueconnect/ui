import * as _ from 'lodash';

import {meetups, users} from './mockdata';
import * as models from './models';

export function requestLoginEmail(address: string): Promise<{}> {
    return new Promise((resolve, reject) => {
        console.log(users);
        if (_.some(users, {email: address})) {
            return resolve();
        }
        return reject('The requested email address could not be found.');
    });
}

export function checkHash(hash: string): Promise<models.User> {
    return new Promise((resolve, reject) => {
        const user = _.find(users, (u) => _.startsWith(u.email, hash));
        if (user == null) {
            return reject('Where did you get this hash?');
        }
        return resolve(user);
    });
}

function maybeError() {
    if  (_.random(0, 100, false) > 95) {
        throw new Error('Something went wrong.');
    }
}

async function sleep() {
    return new Promise((resolve) => setTimeout(resolve, 500));
}

function getMeetupById(meetupId: models.BaseMeetup['id']) {
    const match = _.find(meetups, {id: meetupId});
    if (match == null) {
        throw new Error(`No meetup with id ${meetupId} exists.`);
    }
    return match;
}

export async function createMeetup(meetup: models.MeetupDetails): Promise<models.MeetupDetails> {
    maybeError();
    meetups.push(meetup);
    meetup.id = `${meetups.length}`;
    return meetup;
}

export async function getMeetupList(): Promise<models.BaseMeetup[]> {
    maybeError();
    return meetups;
}

export async function getMeetupDetails(meetupId: models.BaseMeetup['id']): Promise<models.MeetupDetails> {
    maybeError();
    return getMeetupById(meetupId);
}

export async function addAttendee(meetupId: models.BaseMeetup['id'], attendee: models.User): Promise<models.MeetupDetails> {
    maybeError();
    const match = getMeetupById(meetupId);
    match.attendees.push(attendee);
    return match;
}

export async function setPresenter(meetupId: models.BaseMeetup['id'], presenter: models.User): Promise<models.MeetupDetails> {
    maybeError();
    const match = getMeetupById(meetupId);
    if (match.presenter != null) {
        throw new Error('Somebody is already presenting on this.');
    }
    match.presenter = presenter;
    return match;
}

export async function addChatMessage(meetupId: models.BaseMeetup['id'], message: models.Message): Promise<models.MeetupDetails> {
    maybeError();
    const match = getMeetupById(meetupId);
    match.chat.push(message);
    return match;
}
