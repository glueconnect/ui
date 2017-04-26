import * as _ from 'lodash';

import {meetups, users} from './mockdata';
import * as Models from './models';

export function requestLoginEmail(address: string): Promise<{}> {
    return new Promise((resolve, reject) => {
        console.log(users);
        if (_.some(users, {email: address})) {
            return resolve();
        }
        return reject('The requested email address could not be found.');
    });
}

export function checkHash(hash: string): Promise<Models.User> {
    return new Promise((resolve, reject) => {
        const user = _.find(users, (u) => _.startsWith(u.email, hash));
        if (user == null) {
            return reject('Where did you get this hash?');
        }
        return resolve(user);
    });
}
