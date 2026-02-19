import React, { useEffect, useState } from 'react';
import { toTurkishUpperCase } from './toTurkishUppercase';
// import './OnlineUsersSidebar.css'; // CSS dosyanızı bu şekilde dahil edin

const OnlineUsersSidebar = ({ currentUserPersonelId, messageUsers, setMessageUser, messageUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };


    useEffect(() => {
        var dd = messageUsers?.filter(x => { return x.PersonelId != currentUserPersonelId })
        if (dd) {
            setUsers(dd)
        }

    }, [messageUsers])
    return (
        <div className={`card card-sidebar-mobile ${isOpen ? 'open' : 'closed'}`}>
            <div className="table-header">
                <p>Online kullanıcılar</p>

            </div>

            <>
                <div className="chat-searchbar">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Kullanıcı ara"
                        value={searchText}
                        onChange={(val) => {

                            setSearchText(toTurkishUpperCase(val.target.value))

                        }}
                    />
                </div>
                <div style={{
                    padding: 13,
                    height: 480,
                    overflow: "auto"
                }}>
                    {users.filter((x) => {
                        {

                            if (searchText) {
                                return x.AdSoyad.includes(searchText)
                            } else {
                                return x
                            }

                        }
                    }).map((item, key) => (
                        <div onClick={() => setMessageUser([...messageUser, item])} className="col-12 p-1 usr-hvr" key={key}>
                            <div style={{ fontSize: 11 }}><i className='onlinedot' style={item.IsSocketConnect && { background: "green" } || { background: "red" }}></i> {item.AdSoyad}</div>
                        </div>
                    ))}
                </div>
            </>

        </div>
    );
};

export default OnlineUsersSidebar;
