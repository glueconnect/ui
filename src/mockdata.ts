import {BaseMeetup, MeetupDetails, User} from './models';

export const users: User[] = [
    {
        id: '0',
        name: 'Erin Noe-Payne',
        email: 'erin.noe.payne@gmail.com',
    },
    {
        id: '1',
        name: 'Chris Langager',
        email: 'chris.langager@gmail.com',
    },
    {
        id: '2',
        name: 'Jason Miller',
        email: 'jason.miller@gmail.com',
    },
    {
        id: '3',
        name: 'Kevin Saldaña',
        email: 'kevin.saldana@gmail.com',
    },
];

export const meetups: MeetupDetails[] = [
    {
        id: '0',
        title: 'How to Build an API in 15 Minutes',
        description: 'Can you really build an API in 15 minutes? With LoopBack, the open-source Javascript framework for APIs, you can! LoopBack, based on Express, makes creating and extending a basic CRUD API painless. LoopBack handles the drudgery so you can concentrate on what\'s important: your data, your users, and bringing the two together with a stable, well-designed, and well-understood API.',
        presenter: users[0],
        attendees: [],
        chat: [],
        attendeeCount: 0,
        chatCount: 0,
        pendingAttendees: [],
        pendingChat: [],
    },
    {
        id: '1',
        title: 'The Importance of Personal Storytelling',
        description: 'Happily, we\'re emerging from the crazy days of content farms but that doesn\'t mean content marketing is dead. In fact, it has taken a healthy pivot that is much more knowledge-focused and community-oriented. Let\'s talk about what developers want to read about and, more importantly, what they want to write about.... and how to make that all happen.',
        presenter: null,
        attendees: users.slice(0, 2),
        chat: [],
        attendeeCount: 2,
        chatCount: 0,
        pendingAttendees: [],
        pendingChat: [],
    },
    {
        id: '2',
        title: 'API Modeling Framework:  A Toolbox for Interacting With API Specs',
        description: 'MuleSoft\'s API Modeling Framework (AMF) provides a way for developers to interact with API specifications written in either RAML or OpenAPI. This talk will give an overview of AMF, a set of tools to model, query and expose all aspects of an API specification. During this talk, we will go through several use cases, some simple and some more complex ones, to showcase how this can be useful at all stages of the API design process. We will show how AMF stores model and data for the model in a single unified data graph, and how it persists and allows querying using a declarative language. We will also show how, thanks to the formal qualities of the tools, automatic reasoning can be used to add inferred data to the model in order to solve particular data integration scenarios.',
        presenter: users[3],
        attendees: users.slice(0, 2),
        chat: [],
        attendeeCount: 2,
        chatCount: 0,
        pendingAttendees: [],
        pendingChat: [],
    },
    {
        id: '3',
        title: 'The Ansible Container Project: Lessons for Doing Containers',
        description: 'Containers offer unparalleled potential for more scalable, reliable, and secure services, however adoption has been slow, in no small part because the majority of the tools and techniques we’ve developed over the last 30 years simply aren’t useful in a containerized ecosystem. Ansible has taken the automation landscape by storm precisely because it’s so universally adaptable, and the Ansible Container project has brought the power of Ansible tools and experience to the container world. In this talk, we introduce Ansible Container, and how it uniquely offers building and running containers using the simple, powerful, and agentless software development lifecycle Ansible Core delivered to the rest of IT.',
        presenter: null,
        attendees: users.slice(1, 2),
        chat: [],
        attendeeCount: 1,
        chatCount: 0,
        pendingAttendees: [],
        pendingChat: [],
    },
];
