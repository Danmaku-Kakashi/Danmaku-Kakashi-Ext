import React, {useEffect} from 'react';
import {useState} from 'react';

const UserInfo = () => {
    const [accessToken, setAccessToken] = useState('');
    const [username, setUsername] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [emoji, setEmoji] = useState('');

    // Get access token
    useEffect(() => {
        chrome.runtime.sendMessage({
            type: 'FETCH_GENERAL',
            url: process.env.REACT_APP_API_BASE_URL + '/api/token/refresh/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, function (response) {
            if (response) {
                if (response.result) {
                    console.log("", response.result);
                    setAccessToken(response.result.access);
                }
            }
        });
    }, [])

    // Get username
    useEffect(() => {
        if (accessToken) {
            chrome.runtime.sendMessage({
                type: 'FETCH_GENERAL',
                url: process.env.REACT_APP_API_BASE_URL + '/api/check-login-status/',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                }
            }, function (response) {
                if (response) {
                    if (response.result) {
                        console.log("", response.result);
                        setUsername(response.result.username);
                        setIsLogin(true);
                    }
                }
            });
        }
    }, [accessToken]);

    return (
        <div className="userinfo">
            {isLogin ?
            (<div className="user">
                <p className="username">{username}</p>
                <p className="emoji">{emoji}</p>
            </div>)
            :
            (<p className="login">Please login on dm-kks.com</p>)}
        </div>
    );
}

export default UserInfo;