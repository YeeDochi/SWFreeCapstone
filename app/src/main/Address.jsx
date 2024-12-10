import React, { useState } from 'react';
import '../css/Address.css';

const AddressBook = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupname, setGroupname] = useState('');
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    // 예시 데이터 - 그룹과 연락처 목록
    const [addressData, setAddressData] = useState({
        "Family": [
            { name: "정다빈", phone: "010-1234-5678" },
            { name: "이영희", phone: "010-8765-4321" }
        ],
        "Friends": [
            { name: "박지성", phone: "010-3333-4444" },
            { name: "손흥민", phone: "010-5555-6666" }
        ],
        "Work": [
            { name: "김철수", phone: "010-7777-8888" },
            { name: "홍길동", phone: "010-9999-0000" }
        ]
    });

    // 그룹 클릭 시 해당 그룹의 연락처 정보 설정
    const handleGroupClick = (groupName) => {
        setSelectedGroup(groupName);
    };

    // 그룹 추가 기능
    const handleGroupMake = () => {
        if (groupname.trim() && !addressData[groupname]) {
            // 새로운 그룹 이름 추가
            setAddressData(prevData => ({
                ...prevData,
                [groupname]: []  // 새로운 그룹을 빈 배열로 추가
            }));
            setIsGroupModalOpen(false);
            setGroupname('');
        } else {
            alert("그룹 이름을 입력하거나, 이미 존재하는 그룹 이름은 사용할 수 없습니다.");
        }
    };

    // 회원 추가 기능
    const handleUserMake = () => {
        if (selectedGroup && contactName.trim() && contactPhone.trim()) {
            // 선택된 그룹에 새로운 연락처 추가
            setAddressData(prevData => ({
                ...prevData,
                [selectedGroup]: [
                    ...prevData[selectedGroup],
                    { name: contactName, phone: contactPhone }
                ]
            }));
            setIsContactModalOpen(false);  // 모달 닫기
            setContactName('');
            setContactPhone('');
        } else {
            alert("연락처 정보를 모두 입력해주세요.");
        }
    };

    return (
        <div className="address_main">
            <div className='textbobo'>
                <h2>주소록</h2>
            </div>
            <div className='address_context'>
                <div className="group">
                    <button onClick={() => setIsGroupModalOpen(true)}>그룹 추가</button>
                    <h3>그룹 목록</h3>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>그룹 이름</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(addressData).map((group) => (
                                <tr key={group} onClick={() => handleGroupClick(group)} style={{ cursor: 'pointer' }}>
                                    <td>{group}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isGroupModalOpen && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <h2>그룹추가</h2>
                            <input
                                type="text"
                                placeholder="그룹 이름"
                                value={groupname}
                                onChange={(e) => setGroupname(e.target.value)}
                            />
                            <button onClick={handleGroupMake}>그룹추가</button>
                            <button onClick={() => setIsGroupModalOpen(false)}>취소</button>
                        </div>
                    </div>
                )}

                <div className="group_people">
                    <button onClick={() => setIsContactModalOpen(true)}>회원 추가</button>
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
                                <button onClick={handleUserMake}>연락처 추가</button>
                                <button onClick={() => setIsContactModalOpen(false)}>취소</button>
                            </div>
                        </div>
                    )}

                    <h3>{selectedGroup} 연락처</h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', width: '100%' }}>
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>전화번호</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedGroup && addressData[selectedGroup].map((contact, index) => (
                                    <tr key={index}>
                                        <td>{contact.name}</td>
                                        <td>{contact.phone}</td>
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
