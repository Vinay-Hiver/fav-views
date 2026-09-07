import React, { useState } from 'react';
import '../App.css';
import SidebarOption1 from './SidebarOption1';
import ConversationList from '../components/ConversationList';
import ConversationDetail from '../components/ConversationDetail';
import RightPanel from '../components/RightPanel';
import OptionSwitcher from './OptionSwitcher';

// Small dummy dataset — just enough to render a real-looking conversation
// list/detail alongside the sidebar being explored here.
const conversationsData = [
  {
    id: 1,
    inbox: 'Support',
    type: 'Mine',
    sender: 'John Smith',
    initial: 'J',
    avatarColor: 'var(--pastelRedBorderDefault)',
    time: 'Feb 4, 02:45 PM',
    subject: 'Issue with the app',
    preview: 'I am seeing a blank screen after login.',
    threadCount: 3,
    messages: [
      {
        id: 'm1',
        sender: 'John Smith',
        email: 'john.smith@gmail.com',
        time: 'Feb 4, 01:20 PM',
        initial: 'J',
        avatarColor: 'var(--pastelRedBorderDefault)',
        body: 'Hi Support,\n\nI am experiencing a blank screen after logging in to the mobile app. Can you please help?',
      },
      {
        id: 'm2',
        sender: 'Ruben Geidt',
        email: 'ruben@acme.com',
        time: 'Feb 4, 02:00 PM',
        initial: 'R',
        avatarColor: 'var(--pastelLightBlueBorderDefault)',
        body: 'Hello John,\n\nI am looking into this. Could you let me know which device you are using?',
      },
    ],
  },
  {
    id: 2,
    inbox: 'Support',
    type: 'Mine',
    sender: 'Alice Johnson',
    initial: 'A',
    avatarColor: 'var(--pastelVioletBorderDefault)',
    time: 'Feb 4, 11:30 AM',
    subject: 'Refund status',
    preview: 'Has the refund been processed yet?',
    threadCount: 2,
    messages: [
      {
        id: 'm1',
        sender: 'Alice Johnson',
        email: 'alice.j@outlook.com',
        time: 'Feb 4, 10:00 AM',
        initial: 'A',
        avatarColor: 'var(--pastelVioletBorderDefault)',
        body: 'Hello,\n\nI requested a refund last week but haven\'t seen it in my account yet. Any updates?',
      },
    ],
  },
];

function App1() {
  const [selectedId, setSelectedId] = useState(1);
  const [activeFilter, setActiveFilter] = useState({ inbox: 'Support', type: 'Mine' });
  const [signatures, setSignatures] = useState([]);
  const [defaultSignatureId, setDefaultSignatureId] = useState(null);
  const [activeRole, setActiveRole] = useState('Admin');

  const filteredConversations = conversationsData.filter(
    (c) => c.inbox === activeFilter.inbox && c.type === activeFilter.type
  );
  const selectedConversation = conversationsData.find((c) => c.id === selectedId) || null;

  React.useEffect(() => {
    setSelectedId(filteredConversations.length > 0 ? filteredConversations[0].id : null);
  }, [activeFilter.inbox, activeFilter.type]);

  return (
    <div className="app-container">
      <OptionSwitcher current="option_1" />
      <SidebarOption1 activeFilter={activeFilter} onFilterChange={setActiveFilter} activeRole={activeRole} />
      <ConversationList
        conversations={filteredConversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        activeFilter={activeFilter}
      />
      <ConversationDetail
        conversation={selectedConversation}
        signatures={signatures}
        setSignatures={setSignatures}
        defaultSignatureId={defaultSignatureId}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
      />
      <RightPanel />
    </div>
  );
}

export default App1;
