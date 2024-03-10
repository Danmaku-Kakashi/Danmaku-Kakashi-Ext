import React, {useEffect} from 'react';
import './User.css';
import { useAccessToken } from '../AccessTokenContext';
import {useState} from 'react';
import { useTranslation } from 'react-i18next'; 
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';

export function WebMenu() {

    // State for anchor element of the menu (null when menu is closed)
    const [anchorEl, setAnchorEl] = useState(null);
    const { t } = useTranslation();
  
    // Handles opening the menu
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    // Handles closing the menu
    const handleClose = () => {
      setAnchorEl(null);
    };

    const TabUrl = {
        'site': process.env.REACT_APP_API_WEB_URL,
        'doc': process.env.REACT_APP_API_WEB_URL + 'doc',
        'about': process.env.REACT_APP_API_WEB_URL + 'about',
        'github': 'https://github.com/Danmaku-Kakashi/Danmaku-Kakashi-Ext',
        'donate': process.env.REACT_APP_API_WEB_URL + 'donate'
    }
    const handleItemClick = (url) => {
        window.open(url, '_blank');
        handleClose();
    }

    return (
      <>
        <IconButton 
          edge="start" 
          color="inherit" 
          aria-label="menu" 
          style={{position: 'absolute', top: 5, left: 5, zIndex: 1, margin: 0, padding: 0}}
          onClick={handleClick} // Added onClick handler here
        >
          <MenuIcon style={{fontSize: 24}}/>
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose} // Close the menu when an item is selected or clicking away
        >
          <MenuItem onClick={() => handleItemClick(TabUrl.site)}>{t('Our Site')}</MenuItem>
          <MenuItem onClick={() => handleItemClick(TabUrl.doc)}>{t('Doc')}</MenuItem>
          <MenuItem onClick={() => handleItemClick(TabUrl.about)}>{t('About')}</MenuItem>
          <MenuItem onClick={() => handleItemClick(TabUrl.github)}>GitHub</MenuItem>
          <MenuItem onClick={() => handleItemClick(TabUrl.donate)}>{t('Donate')}</MenuItem>
        </Menu>
      </>
    );
  }

const UserInfo = () => {

    const { t, i18n } = useTranslation();
    const [lang, setLang] = React.useState(i18n.language);

    const { accessToken, setAccessToken } = useAccessToken();
    const [username, setUsername] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [emoji, setEmoji] = useState('');
    const [backgroundColor, setBackgroundColor] = useState('');

    const updateAccessToken = (newToken) => {
        setAccessToken(newToken);
    };

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
                    updateAccessToken(response.result.access);
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
                        console.log("Get Result: ", response.result);
                        setUsername(response.result.username);
                        console.log("lang: ", response.result.preferred_language);
                        i18n.changeLanguage(response.result.preferred_language);
                        setLang(response.result.preferred_language);
                        const parts = response.result.user_pic.split(',');
                        if (parts.length === 2) {
                            setEmoji(parts[0]);
                            setBackgroundColor(parts[1]);
                        }
                        setIsLogin(true);
                    }
                }
            });
        }
    }, [accessToken]);

    return (
        <div className="userinfo">
            <WebMenu />
            <h3 style={{position: 'absolute', top: 5, left: 30, zIndex: 1, margin: 0, padding: 0}} >|</h3>

            {isLogin ?(
            <div className="user">
                <Avatar 
                    sx={{ 
                    fontFamily: 'Noto Color Emoji', 
                    bgcolor: backgroundColor, 
                    width: '24px', 
                    height: '24px', 
                    fontSize: '8px',
                    cursor: 'pointer', // Changes the cursor to indicate it's clickable
                    transition: 'transform 0.3s ease', // Smooth transition for feedback
                    '&:hover': {
                        transform: 'scale(1.1)', // Slightly enlarges the avatar on hover
                        boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)', // Adds shadow around the avatar on hover
                    }
                    }}
                    style={{
                    position: 'absolute', 
                    top: 6, 
                    left: 40, 
                    zIndex: 1, 
                    margin: 0, 
                    padding: 0
                    }}
                    onClick={() => window.open(process.env.REACT_APP_API_WEB_URL + 'leaderboard', '_blank')}>
                    {emoji}
                </Avatar>
            </div>
            ):(
            <div className="register-container">
                <button 
                // if click, it will open a new tab to login
                onClick={() => window.open(process.env.REACT_APP_API_WEB_URL + 'leaderboard', '_blank')}
                style={{position: 'absolute', top: 8.5, left: 40, zIndex: 1, margin: 0, padding: 0}}>
                    Login
                </button>
            </div>
            )}
        </div>
    );
}

export default UserInfo;