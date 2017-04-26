import * as React from 'react';
import {RouteComponentProps} from 'react-router-dom';

interface RouteParams {
    meetupId: string;
}

export class MeetupDetailsView extends React.PureComponent<RouteComponentProps<RouteParams>, {}> {
    render() {
        return (
            <div className="column is-half">
                Details View: {this.props.match.params.meetupId}
            </div>
        );
    }
}
