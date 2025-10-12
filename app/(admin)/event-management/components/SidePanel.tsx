'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon';

type SidePanelProps = {
  createNewEvent: () => void;
};

const SidePanel = ({ createNewEvent }: SidePanelProps) => {
  return (
    <>
      <div className="d-grid">
        <button className="btn btn-primary btn-lg" onClick={createNewEvent}>
          <IconifyIcon icon="mdi:plus-circle" /> Create New Event
        </button>
      </div>
      <div className="mt-5 d-none d-xl-block">
        <h5 className="text-center">How to Use</h5>
        <ul className="ps-3">
          <li className="text-muted mb-3">
            Click the <strong>"Create New Event"</strong> button to add a new entry.
          </li>
           <li className="text-muted mb-3">
            Click on any empty date on the calendar to schedule an event for that day.
          </li>
          <li className="text-muted mb-3">
            Click on an <strong>existing event</strong> to view, edit, or delete it.
          </li>
        </ul>
      </div>
    </>
  );
};

export default SidePanel;
