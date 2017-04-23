import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {RouteComponentProps} from 'react-router-dom';

// import * as backend from '../backend';
import * as auth from '../services/auth';
import * as actions from '../actions';

interface RouteParams {
    hash: string;
}

interface State {
    errorMessage: string;
}

interface MappedActions {
    login(token: string): Promise<{}>,
}
const mapActions = {
    login: actions.login,
}

export class LoginViewComponent extends React.PureComponent<RouteComponentProps<RouteParams> & MappedActions, State> {
    constructor(props: any) {
        super(props)

        this.state = {
            errorMessage: "",
        }

        const token = this.props.match.params.hash;
        
        this.props.login(token).catch((err: any) => {
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