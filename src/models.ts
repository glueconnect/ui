import * as _ from 'lodash';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Message {
    author: User;
    text: string;
}

//TODO: scheduling?
export interface Meetup {
    id: string;
    title: string;
    description: string;
    presenter: User;
    attendees: User[];
    chat: Message[];
}

//TODO: pending meetups for those created client side but not yet accepted server-side?
export interface AppState {
    authToken: string;
    user: User;
    meetups: Meetup[];
}
