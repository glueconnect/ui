import * as _ from 'lodash';
import * as React from 'react';
import {connect} from 'react-redux';
import {Link, RouteComponentProps} from 'react-router-dom';
import {Action} from 'typescript-fsa';

import {BaseMeetup} from '../models';
import {RootState} from '../store';
import {GetMeetupListRequest, MeetupsState, SetFilterString } from '../store/meetups';

// needs updating
type MappedStateProps = Pick<MeetupsState['list'], 'items' | 'filter'>;
function mapStateToProps(state: RootState, ownProps: void): MappedStateProps {
    return {
        items: state.meetups.list.items,
        filter: state.meetups.list.filter,
    };
}

interface MappedDispatchProps {
    GetMeetupListRequest: any;
    SetFilterString: any;
}
const mapDispatchToProps = {
    GetMeetupListRequest,
    SetFilterString,
};

type Props = MappedStateProps & MappedDispatchProps& RouteComponentProps<{}>;

export class MeetupList extends React.PureComponent<Props, {}> {
    constructor(props: any) {
        super(props);

        this.props.GetMeetupListRequest();
    }

    render() {
        return (
            <div>
                <div>
                    <input type="text" placeholder="Search or create" value={this.props.filter} onChange={this.setFilter}/>
                </div>
                <div>
                    {this.props.items.map(this.renderMeetupCard)}
                </div>
            </div>
        );
    }

    private setFilter = (e: React.SyntheticEvent<HTMLInputElement>) => {
        this.props.SetFilterString({filter: e.currentTarget.value});
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
