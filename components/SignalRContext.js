import React, { createContext, useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { apiConstant } from '../pages/api/crud';

export const SignalRContext = createContext();

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("dgbrdconftknserr");
    const newConnection = new signalR.HubConnectionBuilder()
    .withUrl(apiConstant + "/signalrhub",
        {
            transport: signalR.HttpTransportType.WebSockets,
            logging: signalR.LogLevel.Information,
            accessTokenFactory: () => { return token },
            skipNegotiation: true,

        }
    ) // Backend URL'nizi buraya koyun

    .build();
    
setConnection(newConnection)
    return () => {
      if (newConnection) {
        
        newConnection.stop();
      }
    };
  }, []);

  return (
    <SignalRContext.Provider value={connection}>
      {children}
    </SignalRContext.Provider>
  );
};
