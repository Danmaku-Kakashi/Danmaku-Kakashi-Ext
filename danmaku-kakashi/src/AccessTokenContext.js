import React, { createContext, useContext, useState } from 'react';

// create a context
const AccessTokenContext = createContext();

// create a provider
export const AccessTokenProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);

    return (
        <AccessTokenContext.Provider value={{ accessToken, setAccessToken }}>
            {children}
        </AccessTokenContext.Provider>
    );
};

// create a hook to use the context
export const useAccessToken = () => useContext(AccessTokenContext);