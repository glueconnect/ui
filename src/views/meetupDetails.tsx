import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {Link, RouteComponentProps} from 'react-router-dom';

import {users} from '../mockdata';
import {RootState} from '../store';
import {AddAttendee, GetMeetupDetailsRequest, MeetupsState} from '../store/meetups';

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
}
const mapDispatchToProps = {
    GetMeetupDetailsRequest,
    AddAttendee,
};

type Props = RouteComponentProps<RouteParams> & DispatchProps & MappedStateProps;
export class MeetupDetailsViewComponent extends React.PureComponent<Props, {}> {
    constructor(props: any) {
        super(props);

        this.props.GetMeetupDetailsRequest({meetupId: this.props.match.params.meetupId});
    }

    render() {
        const {errorMessage, isLoading, meetup, pendingAttendees, pendingChat} = this.props;


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
                    <p>Attendees: {meetup.attendees.length} ({_.size(pendingAttendees)})</p>
                    <p><button onClick={this.join}>Join!</button></p>
                    {meetup.chat.map((message, index) => (
                        <div key={index}>{message.text}</div>
                    ))}
                    {_.map(pendingChat, (message, index) => (
                        <div style={{color: 'blue'}}key={index}>{message.text}</div>
                    ))}
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
}

export const MeetupDetailsView = connect(mapStateToProps, mapDispatchToProps)(MeetupDetailsViewComponent);
