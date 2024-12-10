import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Address.css';
import { useAuth } from './AuthContext.jsx';

const AddressBook = () => {
    const { isLoggedIn, username } = useAuth();

    // 상태 관리
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState(null);


    // 그룹 목록 불러오기
    const fetchGroups = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/groups', { withCredentials: true, });
            if (response.data.status === 'success') {
                setGroups(response.data.groups);
            } else {
                alert(response.data.message || '그룹 목록을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error(error);

        }
    };
    

    

    // 특정 그룹의 연락처 불러오기
    const fetchContacts = async (groupId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/groups/${groupId}/contacts`, { withCredentials: true, });
            if (response.data.status === 'success') {
                setContacts(response.data.contacts);
                setSelectedGroup(groups.find((group) => group.group_id === groupId));
            } else {
                alert(response.data.message || '연락처를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('연락처를 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 그룹 추가
    const handleGroupMake = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/groups', { group_name: groupName }, { withCredentials: true, });
            if (response.data.status === 'success') {
                setGroupName('');
                setIsGroupModalOpen(false);
                fetchGroups(); // 새로고침
            } else {
                alert(response.data.message || '그룹 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('그룹 추가 중 오류가 발생했습니다.');
        }
    };

    // 연락처 추가
    const handleUserMake = async () => {
        try {
            if (!selectedGroup) {
                alert('먼저 그룹을 선택해주세요.');
                return;
            }

            const response = await axios.post(`http://localhost:8080/api/groups/${selectedGroup.group_id}/contacts`, {
                name: contactName,
                phone: contactPhone,
            }, { withCredentials: true, });

            if (response.data.status === 'success') {
                setContactName('');
                setContactPhone('');
                setIsContactModalOpen(false);
                fetchContacts(selectedGroup.group_id); // 새로고침
            } else {
                alert(response.data.message || '연락처 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('연락처 추가 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteGroup = async (groupId) => {
        const confirmation = window.confirm('이 그룹을 삭제하시겠습니까? 삭제하면 이 그룹에 속한 모든 연락처도 함께 삭제됩니다.');
        if (!confirmation) return; // 취소 버튼 클릭 시 삭제 중단

        try {
            const response = await axios.delete(`http://localhost:8080/api/groups/${groupId}`, {
                withCredentials: true,
            });

            if (response.data.status === 'success') {
                alert('그룹이 삭제되었습니다.');
                fetchGroups(); // 그룹 목록 새로고침
            } else {
                alert(response.data.message || '그룹 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('그룹 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteContact = async (contactId) => {
        const confirmation = window.confirm('이 연락처를 삭제하시겠습니까?');
        if (!confirmation) return; // 취소 버튼 클릭 시 삭제 중단

        try {
            const response = await axios.delete(`http://localhost:8080/api/contacts/${contactId}`, {
                withCredentials: true,
            });

            if (response.data.status === 'success') {
                alert('연락처가 삭제되었습니다.');
                if (selectedGroup) fetchContacts(selectedGroup.group_id); // 선택된 그룹 연락처 새로고침
            } else {
                alert(response.data.message || '연락처 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('연락처 삭제 중 오류가 발생했습니다.');
        }
    };

    // 그룹 클릭 핸들러
    const handleGroupClick = (groupId) => {
        fetchContacts(groupId);
        setSelectedGroupId(groupId);
    };

    // 페이지 로드 시 그룹 목록 불러오기
    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div className="address_main">
            <div className="textbobo">
                <h1>주소록</h1>
                {username && <h3>{username} 님 환영합니다!</h3>}
            </div>

            <div className="address_context">
                {/* 그룹 목록 */}
                <div className="group">
    {!isGroupModalOpen && (
        <button onClick={() => setIsGroupModalOpen(true)}>그룹 추가</button>
    )}
    {isGroupModalOpen && (
        <div className="modal-below-table">
            <div className="modal-contents">
                <h2>그룹 추가</h2>
                <input
                    type="text"
                    placeholder="그룹 이름"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
                <div>
                <button onClick={handleGroupMake}>추가</button>
                <button onClick={() => setIsGroupModalOpen(false)}>취소</button>
                </div>
            </div>
        </div>
    )}
    <h3>그룹 목록</h3>
    <table className="styled-table">
        <thead>
            <tr>
                <th>그룹 이름</th>
                <th>관리</th>
            </tr>
        </thead>
        <tbody>
            {groups.map((group) => (
                <tr key={group.group_id}
                >
                    <td
                onClick={() => handleGroupClick(group.group_id)}
                style={{
                    cursor: 'pointer',
                    backgroundColor: selectedGroupId === group.group_id ? '#d7e0eb' : 'transparent',
                    fontWeight: selectedGroupId === group.group_id ? 'bold' : 'normal',
                }}
            >
                {group.group_name}
            </td>
                    <td style={{
                    cursor: 'pointer',
                    backgroundColor: selectedGroupId === group.group_id ? '#d7e0eb' : 'transparent',
                    fontWeight: selectedGroupId === group.group_id ? 'bold' : 'normal',
                }}>
                        <button
                            id="del"
                            onClick={() => handleDeleteGroup(group.group_id)}
                            
                        >
                            삭제
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

<div className="group_people">
    {!isContactModalOpen && (
        <button onClick={() => setIsContactModalOpen(true)}>회원 추가</button>
    )}
    {isContactModalOpen && (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>연락처 추가</h2>
                <input
                    type="text"
                    placeholder="이름"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="전화번호"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                />
                <div>
                <button onClick={handleUserMake}>연락처 추가</button>
                <button onClick={() => setIsContactModalOpen(false)}>취소</button>
                </div>
            </div>
        </div>
    )}
    <h3>
        {selectedGroup
            ? `${selectedGroup.group_name} 연락처`
            : '그룹을 선택하세요'}
    </h3>
    <div
        style={{
            maxHeight: '400px',
            overflowY: 'auto',
            width: '100%',
        }}
    >
        <table className="styled-table">
            <thead>
                <tr>
                    <th>이름</th>
                    <th>전화번호</th>
                    <th>관리</th>
                </tr>
            </thead>
            <tbody>
                {contacts.map((contact) => (
                    <tr key={contact.contact_id}>
                        <td>{contact.name}</td>
                        <td>{contact.phone}</td>
                        <td>
                            <button
                                id="del"
                                onClick={() =>
                                    handleDeleteContact(contact.contact_id)
                                }
                            >
                                삭제
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>


               
            </div>
        </div>
    );
};

export default AddressBook;