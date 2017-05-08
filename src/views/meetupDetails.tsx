import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {Link, RouteComponentProps} from 'react-router-dom';

import {users} from '../mockdata';
import {RootState} from '../store';
import {AddAttendee, AddChat, AddPendingChat, AddPresenter, GetMeetupDetailsRequest, MeetupsState} from '../store/meetups';

interface RouteParams {
    meetupId: string;
}

type MappedStateProps = MeetupsState['details'];
function mapStateToProps(state: RootState, ownProps: void): MappedStateProps {
    return state.meetups.details;
}

interface DispatchProps {
    GetMeetupDetailsRequest: any;
    AddAttendee: any;
    AddPresenter: any;
    AddChat: any;
    AddPendingChat: any;
}
const mapDispatchToProps = {
    GetMeetupDetailsRequest,
    AddAttendee,
    AddPresenter,
    AddChat,
    AddPendingChat,
};

interface State {
    chatText: string;
}

type Props = RouteComponentProps<RouteParams> & DispatchProps & MappedStateProps;
export class MeetupDetailsViewComponent extends React.PureComponent<Props, State> {
    constructor(props: any) {
        super(props);

        this.props.GetMeetupDetailsRequest({meetupId: this.props.match.params.meetupId});

        this.state = {
            chatText: '',
        };
    }

    render() {
        const {errorMessage, isLoading, meetup, pendingAttendee, pendingPresenter, pendingChat} = this.props;


        let content;
        if (isLoading) {
            content = <div>Loading...</div>;
        } else if (errorMessage !== '') {
            content = <div>There was an error: {errorMessage}</div>;
        } else {
            content = (
                <div>
                    <h1>{meetup.title}</h1>
                    <p>{meetup.description}</p>
                    <p>Presenter: {meetup.presenter.name}</p>
                    <p>Attendees: {meetup.attendees.length}</p>
                    <p><button onClick={this.join}>Join!</button></p>
                    {meetup.chat.map((message, index) => (
                        <div key={index}>{message.text}</div>
                    ))}
                    {_.map(pendingChat, ({message, isFailed}, index) => (
                        <div style={{color: 'blue'}}key={index}>
                            {message.text}
                            {isFailed ? '!' : ''}
                        </div>
                    ))}
                    <form onSubmit={this.submitChat}>
                        <input type="text" value={this.state.chatText} onChange={this.setChatText}/>
                    </form>
                </div>
            );
        }

        return (
            <div>
                <Link to="/meetups">Back to meetups</Link>
                {content}
            </div>
        );
    }

    private join = () => {
        this.props.AddAttendee({
            meetupId: this.props.meetup.id,
            user: users[0],
        });
    }

    private setChatText = (e: React.SyntheticEvent<HTMLInputElement>) => {
        this.setState({
            chatText: e.currentTarget.value,
        });
    }

    private submitChat = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        this.props.AddChat({
            meetupId: this.props.meetup.id,
            message: {
                author: users[0],
                text: this.state.chatText,
            },
        });

        this.setState({
            chatText: '',
        });
    }
}

export const MeetupDetailsView = connect(mapStateToProps, mapDispatchToProps)(MeetupDetailsViewComponent);
