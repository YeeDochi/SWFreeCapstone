import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/RecipientModal.css';

const RecipientModal = ({ isOpen, onClose, onRecipientsUpdate }) => {
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState({});
  const [manualRecipients, setManualRecipients] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [currentGroup, setCurrentGroup] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/groups', { withCredentials: true });
      if (response.data.status === 'success') {
        setGroups(response.data.groups);
      } else {
        alert('그룹을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('그룹 불러오기 오류:', error);
    }
  };

  const fetchContacts = async (groupId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/groups/${groupId}/contacts`, { withCredentials: true });
      if (response.data.status === 'success') {
        setContacts(response.data.contacts);
        setCurrentGroup(groupId);
      } else {
        alert('연락처를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('연락처 불러오기 오류:', error);
    }
  };

  const handleAddManualRecipient = () => {
    if (manualInput.trim()) {
      setManualRecipients((prev) => [...prev, manualInput.trim()]);
      setManualInput('');
    }
  };

  const handleRemoveRecipient = (recipient) => {
    // 그룹 상태에서 삭제
    setSelectedRecipients((prev) => {
      const updatedRecipients = { ...prev };
      Object.keys(updatedRecipients).forEach((group) => {
        updatedRecipients[group] = updatedRecipients[group]?.filter((num) => num !== recipient);
      });
      return updatedRecipients;
    });
  
    // 직접 입력된 번호에서 삭제
    setManualRecipients((prev) => prev.filter((num) => num !== recipient));
  };

  const handleRecipientSelection = (phone) => {
    setSelectedRecipients((prev) => ({
      ...prev,
      [currentGroup]: prev[currentGroup]?.includes(phone)
        ? prev[currentGroup].filter((num) => num !== phone)
        : [...(prev[currentGroup] || []), phone],
    }));
  };

  const handleSelectAll = () => {
    if (currentGroup) {
      const allPhones = contacts.map((contact) => contact.phone);
      setSelectedRecipients((prev) => ({
        ...prev,
        [currentGroup]: allPhones,
      }));
    }
  };

  const handleDeselectAll = () => {
    if (currentGroup) {
      setSelectedRecipients((prev) => ({
        ...prev,
        [currentGroup]: [],
      }));
    }
  };

  const getMergedRecipients = () => {
    return Array.from(
      new Set([
        ...Object.values(selectedRecipients).flat(),
        ...manualRecipients,
      ])
    );
  };

  const handleSubmit = () => {
    const allSelectedRecipients = getMergedRecipients();
    onRecipientsUpdate(allSelectedRecipients);

    // 상태 초기화
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>수신번호 설정</h2>
        <button className="close-button" onClick={onClose}>X</button>
        <div>
          <h3>그룹 선택</h3>
          <select onChange={(e) => fetchContacts(e.target.value)}>
            <option value="">그룹을 선택하세요</option>
            {groups.map((group) => (
              <option key={group.group_id} value={group.group_id}>
                {group.group_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h3>연락처</h3>
          <div className="contacts-scrollable">
            {contacts.map((contact) => (
              <div key={contact.contact_id}>
                <input
                  type="checkbox"
                  checked={selectedRecipients[currentGroup]?.includes(contact.phone) || false}
                  onChange={() => handleRecipientSelection(contact.phone)}
                />
                <label>{contact.name} ({contact.phone})</label>
              </div>
            ))}
          </div>
          <div className="contacts-actions">
            <button onClick={handleSelectAll}>모두 선택</button>
            <button onClick={handleDeselectAll}>모두 해제</button>
          </div>
        </div>
        <div>
          <h3>직접 입력</h3>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="수신번호 입력"
          />
          <button style={{marginLeft:'20px'}} onClick={handleAddManualRecipient}>추가</button>
        </div>
        <div>
  <h3>선택된 수신번호</h3>
  <div className="recipients-scrollable">
    {getMergedRecipients().map((recipient) => (
      <div key={recipient} className="recipient-item">
        {recipient}
        <button className="delete-button" onClick={() => handleRemoveRecipient(recipient)}>삭제</button>
      </div>
    ))}
  </div>
</div>
        <div className="modal-actions">
          <button className="submit-button" onClick={handleSubmit}>완료</button>
          <button className="cancel-button" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default RecipientModal;