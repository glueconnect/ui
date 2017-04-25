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
