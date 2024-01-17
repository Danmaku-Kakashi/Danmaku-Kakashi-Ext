import React from "react"
import {useState} from 'react'
import './App.css';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';


const CustomizedInputBase = ({onSearchTrigger}) => {
    const [searchTerm, setSearchTerm] = useState(''); // Track contant of search box
    const handleSearchChange = (event) => {
      setSearchTerm(event.target.value); // Update searchTerm value
    };
    const handleSearch = () => {
      onSearchTrigger(searchTerm); // Call the prop function with searchTerm as argument
    };
    const handleKeyPress = (event) => { // Handle Enter key press
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
      }
    };
    return (
      <div className="topsearch">
        <Paper component="form" sx={{ display: 'flex', alignItems: 'center', width: '100%', 
        backgroundColor: 'palette.text.secondary', border: '2px solid #B61A2B'}}>
          <InputBase
            sx={{ ml: 1, flex: 1, backgroundColor: 'palette.text.secondary',
            '& .MuiInputBase-input::placeholder': { // Targeting the placeholder
              color: '#F1F1F1', // Change placeholder color here
              fontSize: '12px',       // Change placeholder font size here
            },
          }}
            placeholder="Search by keyword or BV number..."
            inputProps={{ 'aria-label': 'search...' }}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSearch}>
            <SearchIcon />
          </IconButton>
        </Paper>
      </div>
    );
  }

export default CustomizedInputBase;