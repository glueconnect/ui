import * as _ from 'lodash';
import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';


import * as auth from '../services/auth';
import * as backend from '../backend';

interface State {
    email: string;
    successMessage: string;
    errorMessage: string;
}

export class RegisterView extends React.PureComponent<RouteComponentProps<{}>, State> {
    constructor(props: any) {
        super(props)

        this.state = {
            email: "",
            successMessage: "",
            errorMessage: "",
        }

        auth.get().then((token) => {
            if (!_.isEmpty(token)) {
                return token
            }
        })
    }

    public render() {
        return (
            <div>
                <h1>GLUECONnect</h1>
                <p>Welcome to glueconnect. As part of your registration, you should have received an email with a login token. Please follow that link 
                    to log in. If you have not received an email or would like to request a new registration token, please enter the email you
                    used for registration and a new token will be sent to you.
                </p>
                <form onSubmit={this.onSubmit}>
                    <input type="email" placeholder="your registration email" value={this.state.email} onChange={this.setPassword}/>
                    <button>Send</button>
                </form>
                <p>{this.state.errorMessage}</p>
            </div>
        )
    }

    private setPassword = (e: React.SyntheticEvent<HTMLInputElement>) => {
        this.setState({
            errorMessage: "",
            email: e.currentTarget.value,
        });
    }

    private onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        backend.requestLoginEmail(this.state.email).then(() => {
            this.setState({
                successMessage: "An email has been sent.",
            })
        }).catch((err) => {
            this.setState({
                errorMessage: err,
            })
        });     
    }
}
