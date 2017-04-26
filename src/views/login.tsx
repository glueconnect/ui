import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { push } from 'react-router-redux';

// import * as backend from '../backend';
import * as auth from '../reducers/auth';

interface RouteParams {
    hash: string;
}

interface State {
    errorMessage: string;
}

interface MappedActions {
    login(token: string): void;
    push(route: string): any;
}
type OwnProps = RouteComponentProps<RouteParams>;
type Props = OwnProps & MappedActions;
const mapStateToProps = (state: any, ownProps: OwnProps) => ({
    login: () => ({ type: 'LOGIN', payload: { token: ownProps.match.params.hash } }),
    push,
});

export class LoginViewComponent extends React.PureComponent<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            errorMessage: '',
        };

        const token = this.props.match.params.hash;

        this.props.login(token).then(() => {
            return this.props.push('/meetups');
        }).catch((err: any) => {
            this.setState({
                errorMessage: err,
            });
        });
    }

    async componentDidMount() {
        try {
            this.props.login(this.props.match.params.hash);
        }
    }

    render() {
        return (
            <div>
                <p>Checking...</p>
                <p>{this.state.errorMessage}</p>
            </div>
        );
    }
}

export const LoginView = connect<void, MappedActions, void>(null, mapActions)(LoginViewComponent);
