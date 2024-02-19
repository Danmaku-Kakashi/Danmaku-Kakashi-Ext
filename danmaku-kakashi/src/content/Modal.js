import React from "react"
import {useState} from 'react'
import { useTranslation } from 'react-i18next';
import './App.css';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Spinner from '@mui/material/CircularProgress';


const Modal = ({ show, onClose, children, arcurl, onLoadDanmakus, pic, title}) => {
  const { t } = useTranslation();
  const [thumb, setThumbnail] = useState('');
  
  if (!show) {
    return null;
  }
  chrome.runtime.sendMessage({ type: 'GET_THUMBNAIL', url: pic }, (response) => {
    setThumbnail(response.thumbnail);
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <IconButton 
        color="inherit"
        style={{position: 'absolute', top: 3, right: 3, zIndex: 1, margin: 0, padding: 0}}
        onClick={onClose} className="modal-close-button">
          <CloseRoundedIcon style={{fontSize: '3vh'}}/>
        </IconButton>
        <div className="popupThumbnail">
          {thumb === '' ? <Spinner /> :
            <img src={thumb} alt={title} />
          }
          <p className='popuptitle'>{title}</p>
        </div>
        {children}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Button 
            style={{ textTransform: 'none', fontSize: '2vh' }}
            variant="contained" 
            color="error" 
            onClick={onLoadDanmakus}>
              {t('Load Danmakus')}
          </Button>
          <Button variant="contained" color="error">
            <a href={arcurl} target="_blank" rel="noopener noreferrer" 
              style={{ textDecoration: 'none', color: 'inherit', textTransform: 'none', fontSize: '2vh' }}>
                {t('Open on BiliBili')}
            </a> 
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Modal;