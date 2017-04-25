import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {RouteComponentProps} from 'react-router-dom';
import {push} from 'react-router-redux';

// import * as backend from '../backend';
import * as auth from '../reducers/auth';

interface RouteParams {
    hash: string;
}

interface State {
    errorMessage: string;
}

interface MappedActions {
    login(token: string): Promise<{}>,
    push(route: string): any,
}
const mapActions = {
    login: auth.login,
    push: push
}

export class LoginViewComponent extends React.PureComponent<RouteComponentProps<RouteParams> & MappedActions, State> {
    constructor(props: any) {
        super(props)

        this.state = {
            errorMessage: "",
        }

        const token = this.props.match.params.hash;
        
        this.props.login(token).then(() => {
            return this.props.push("/meetups");
        }).catch((err: any) => {
            this.setState({
                errorMessage: err,
            });
        });
    }

    public render() {
        return (
            <div>
                <p>Checking...</p>
                <p>{this.state.errorMessage}</p>
            </div>
        )
    }
}

export const LoginView = connect<void, MappedActions, void>(null, mapActions)(LoginViewComponent);