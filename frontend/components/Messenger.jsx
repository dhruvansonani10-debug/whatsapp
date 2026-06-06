import React from 'react';
import { AppBar, Toolbar, styled, Box } from '@mui/material';
import LoginDialog from './account/LoginDialog';

// The WhatsApp top teal banner
const Header = styled(AppBar)`
  background-color: #00a884;
  height: 222px;
  box-shadow: none;
`;

// The full-screen background container
const LoginBackground = styled(Box)`
  height: 100vh;
  background-color: #eae6df; 
  position: relative;
`;

function Messenger() {
  return (
    <LoginBackground>
      <Header position="static">
        <Toolbar>
          {/* You can place a WhatsApp logo here if needed */}
        </Toolbar>
      </Header>
      
      {/* The Login Dialog will float on top of this background */}
      <LoginDialog />
    </LoginBackground>
  );
}

export default Messenger;