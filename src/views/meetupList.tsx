import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {Link, RouteComponentProps} from 'react-router-dom';
import {Action} from 'typescript-fsa';

import {BaseMeetup} from '../models';
import {RootState} from '../store';
import {GetMeetupListRequest} from '../store/meetups';

// needs updating
type MappedStateProps = Pick<any, 'meetups'>;
function mapStateToProps(state: RootState, ownProps: void): MappedStateProps {
    return {
        meetups: state.meetups.list.allItems,
    };
}

interface MappedDispatchProps {
    GetMeetupListRequest: any;
}
const mapDispatchToProps = {
    GetMeetupListRequest,
};


type Props = MappedStateProps & MappedDispatchProps& RouteComponentProps<{}>;

interface State {
    filter: string;
}

export class MeetupList extends React.PureComponent<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            filter: '',
        };

        this.props.GetMeetupListRequest();
    }

    render() {
        return (
            <div>
                <div>
                    <input type="text" placeholder="Search or create" value={this.state.filter} onChange={this.onFilterChange}/>
                </div>
                <div>
                    {this.props.meetups.map(this.renderMeetupCard)}
                </div>
            </div>
        );
    }

    private onFilterChange = (e: any) => {
        this.setState({
            filter : e.target.value,
        });
    }

    private meetupMatchesFilter = (meetup: BaseMeetup): boolean => {
        return _.includes(meetup.title, this.state.filter) || _.includes(meetup.description, this.state.filter) ;
    }

    private renderMeetupCard = (meetup: BaseMeetup) => {
        return (
            <Link to={`/meetups/${meetup.id}`} key={meetup.id}>
                <div style={{borderBottom: '1px solid grey'}}>
                    <h5>{meetup.title}</h5>
                    <p>{meetup.description}</p>
                    <p>{meetup.presenter == null ? '' : meetup.presenter.name}</p>
                    <p>{meetup.attendeeCount} interested attendees</p>
                </div>
            </Link>
        );
    }
}

export const MeetupListView = connect(mapStateToProps, mapDispatchToProps)(MeetupList);
