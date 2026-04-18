import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmt } from '../utils/helpers';
import Modal from './Modal';
import styles from './GroupsTab.module.css';

export default function GroupsTab({ toast }) {
  const { state, dispatch } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [tempMembers, setTempMembers] = useState([]);

  const handleAddMember = () => {
    const name = memberInput.trim();
    if (!name) return;
    if (tempMembers.includes(name)) {
      toast('Member already added', 'error');
      return;
    }
    setTempMembers((prev) => [...prev, name]);
    setMemberInput('');
  };

  const handleRemoveMember = (name) =>
    setTempMembers((prev) => prev.filter((m) => m !== name));

  const handleCreateGroup = () => {
    if (!groupName.trim()) { toast('Enter a group name', 'error'); return; }
    if (tempMembers.length < 2) { toast('Add at least 2 members', 'error'); return; }
    dispatch({ type: 'ADD_GROUP', payload: { name: groupName.trim(), members: tempMembers } });
    setGroupName('');
    setTempMembers([]);
    setMemberInput('');
    setModalOpen(false);
    toast('Group created!', 'success');
  };

  const handleDeleteGroup = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this group and all its expenses?')) return;
    dispatch({ type: 'DELETE_GROUP', payload: id });
    toast('Group deleted', 'success');
  };

  const handleOpenModal = () => {
    setGroupName('');
    setTempMembers([]);
    setMemberInput('');
    setModalOpen(true);
  };

  return (
    <div>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Your Groups</span>
          <button className="btn-primary" onClick={handleOpenModal}>+ New Group</button>
        </div>

        {state.groups.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🏕️</div>
            <p>No groups yet. Create one to get started!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {state.groups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                expenses={state.expenses.filter((e) => e.groupId === g.id)}
                selected={state.selectedGroupId === g.id}
                onSelect={() => dispatch({ type: 'SELECT_GROUP', payload: g.id })}
                onDelete={(e) => handleDeleteGroup(g.id, e)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Group">
        <div className={styles.formGroup}>
          <label className={styles.label}>Group Name</label>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Goa Trip 🌴"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('add-member-btn').click()}
            autoFocus
          />
        </div>

        <div className={styles.formGroup} style={{ marginTop: 14 }}>
          <label className={styles.label}>Add Members</label>
          <div className={styles.memberRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter name & press Enter"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleAddMember(); e.preventDefault(); } }}
            />
            <button id="add-member-btn" className="btn-secondary" onClick={handleAddMember}>
              Add
            </button>
          </div>
          {tempMembers.length > 0 && (
            <div className={styles.memberTags}>
              {tempMembers.map((m) => (
                <span key={m} className={styles.memberTag}>
                  {m}
                  <button onClick={() => handleRemoveMember(m)}>×</button>
                </span>
              ))}
            </div>
          )}
          {tempMembers.length > 0 && (
            <p className={styles.memberCount}>{tempMembers.length} member{tempMembers.length !== 1 ? 's' : ''} added</p>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className="btn-secondary btn-full" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn-primary btn-full" onClick={handleCreateGroup}>Create Group</button>
        </div>
      </Modal>
    </div>
  );
}

function GroupCard({ group, expenses, selected, onSelect, onDelete }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <div className={styles.cardAccent} />
      <div className={styles.cardName}>{group.name}</div>
      <div className={styles.cardMeta}>
        <span>👥 {group.members.length} members</span>
        <span>🧾 {expenses.length} expenses</span>
        <span>💸 ₹{fmt(total)}</span>
      </div>
      <div className={styles.chips}>
        {group.members.slice(0, 5).map((m) => (
          <span key={m} className={styles.chip}>{m}</span>
        ))}
        {group.members.length > 5 && (
          <span className={`${styles.chip} ${styles.chipExtra}`}>+{group.members.length - 5}</span>
        )}
      </div>
      <button className={styles.deleteBtn} onClick={onDelete}>🗑 Delete</button>
    </div>
  );
}
