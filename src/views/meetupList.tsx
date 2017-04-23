import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, Link} from 'react-router-dom';

import {AppState, Meetup} from '../models';

// interface ConnectProps {
//     meetups: AppState["meetups"];
// }
type ConnectProps = Pick<AppState, "meetups">
function mapStateToProps(state: any, ownProps: void): ConnectProps {
    return {
        meetups: state.app.meetups
    };
}
type Props = ConnectProps & RouteComponentProps<{}>

interface State {
    filter: string;
}

export class MeetupList extends React.PureComponent<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            filter: ""
        };
    }

    public render() {
        return (
            <div>
                <div>
                    <input type="text" placeholder="Search or create" value={this.state.filter} onChange={this.onFilterChange}/>
                </div>
                <div>
                    {this.props.meetups.filter(this.meetupMatchesFilter).map(this.renderMeetupCard)}
                </div>
            </div>
        )
    }

    private onFilterChange = (e: any) => {
        this.setState({
            filter : e.target.value
        });
    }

    private meetupMatchesFilter = (meetup: Meetup): boolean => {
        return _.includes(meetup.title, this.state.filter) || _.includes(meetup.description, this.state.filter) ;
    }

    private renderMeetupCard = (meetup: Meetup) => {
        return (
            <div key={meetup.id} style={{borderBottom: '1px solid grey'}}>
                <h5>{meetup.title}</h5>
                <p>{meetup.description}</p>
                <p>{meetup.presenter == null ? '' : meetup.presenter.name}</p>
                <p>{meetup.attendees.length} interested attendees</p>
            </div>
        )
    }
}

export const MeetupListView = connect(mapStateToProps)(MeetupList);