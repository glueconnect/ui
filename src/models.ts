import * as _ from 'lodash';

export interface Error {
    message: string;
    details: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Message {
    author: User;
    text: string;
}

// TODO: scheduling?
export interface BaseMeetup {
    id: string;
    title: string;
    description: string;
    presenter: User;
    attendeeCount: number;
    chatCount: number;
}

export interface MeetupDetails extends BaseMeetup {
    attendees: User[];
    chat: Message[];
}
