import React from 'react';
import { Button, Container, Header, Navbar, Dropdown, Nav, Footer, Content, Icon, Sidebar, Sidenav, Affix } from 'rsuite';

const iconStyles = {
  width: 56,
  height: 56,
  lineHeight: '56px',
  textAlign: 'center'
};

const headerStyles = {
  padding: 18,
  fontSize: 16,
  height: 56,
  background: '#3b3e66',
  color: ' #fff',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
};


// clone schema https://demo.uifort.com/bamburgh-admin-dashboard-pro/

const NavToggle = ({ expand, onChange }) => {
  return (
    <Navbar appearance="subtle" className="nav-toggle">
      <Navbar.Body>
        <Nav>
          <Dropdown
            placement="topStart"
            trigger="click"
            renderTitle={children => {
              return <Icon style={iconStyles} icon="cog" />;
            }}
          >
            <Dropdown.Item>Help</Dropdown.Item>
            <Dropdown.Item>Settings</Dropdown.Item>
            <Dropdown.Item>Sign out</Dropdown.Item>
          </Dropdown>
        </Nav>

        <Nav pullRight>
          <Nav.Item onClick={onChange} style={{ width: 56, textAlign: 'center' }}>
            <Icon icon={expand ? 'angle-left' : 'angle-right'} />
          </Nav.Item>
        </Nav>
      </Navbar.Body>
    </Navbar>
  );
};

const MySideBar = () => {

  return (
    <Sidebar
      className="mc-sidebar"
        style={{ display: 'flex', flexDirection: 'column', height: '100vh', 'position': 'fixed' }}
        width={260}
        collapsible
      >
        <Sidenav
          expanded={true}
          defaultOpenKeys={['3']}
          appearance="subtle"
        >
          <Sidenav.Header>
            <div style={headerStyles}>
              <Icon icon="logo-analytics" size="lg" style={{ verticalAlign: 0 }} />
              <span style={{ marginLeft: 12 }}> BRAND</span>
            </div>
          </Sidenav.Header>
          <Sidenav.Body>
            <Nav>
              <Nav.Item eventKey="1" active icon={<Icon icon="dashboard" />}>
                Dashboard
              </Nav.Item>
              <Nav.Item eventKey="2" icon={<Icon icon="group" />}>
                User Group
              </Nav.Item>
              <Dropdown
                eventKey="3"
                trigger="hover"
                title="Advanced"
                icon={<Icon icon="magic" />}
                placement="rightStart"
              >
                <Dropdown.Item eventKey="3-1">Geo</Dropdown.Item>
                <Dropdown.Item eventKey="3-2">Devices</Dropdown.Item>
                <Dropdown.Item eventKey="3-3">Brand</Dropdown.Item>
                <Dropdown.Item eventKey="3-4">Loyalty</Dropdown.Item>
                <Dropdown.Item eventKey="3-5">Visit Depth</Dropdown.Item>
              </Dropdown>
              <Dropdown
                eventKey="4"
                trigger="hover"
                title="Settings"
                icon={<Icon icon="gear-circle" />}
                placement="rightStart"
              >
                <Dropdown.Item eventKey="4-1">Applications</Dropdown.Item>
                <Dropdown.Item eventKey="4-2">Websites</Dropdown.Item>
                <Dropdown.Item eventKey="4-3">Channels</Dropdown.Item>
                <Dropdown.Item eventKey="4-4">Tags</Dropdown.Item>
                <Dropdown.Item eventKey="4-5">Versions</Dropdown.Item>
              </Dropdown>
            </Nav>
          </Sidenav.Body>
        </Sidenav>
        <NavToggle expand={true} onChange={() => {}} />
      </Sidebar>

  );

}

const MyHeader = () => {

  return (
    <Header className="mc-header">
      <Navbar appearance="inverse">
        <Navbar.Header>
          <a className="navbar-brand logo">BRAND</a>
        </Navbar.Header>
        <Navbar.Body>
          <Nav>
            <Nav.Item icon={<Icon icon="home" />}>Home</Nav.Item>
            <Nav.Item>News</Nav.Item>
            <Nav.Item>Products</Nav.Item>
            <Dropdown title="About">
              <Dropdown.Item>Company</Dropdown.Item>
              <Dropdown.Item>Team</Dropdown.Item>
              <Dropdown.Item>Contact</Dropdown.Item>
            </Dropdown>
          </Nav>
          <Nav pullRight>
            <Nav.Item icon={<Icon icon="cog" />}>Settings</Nav.Item>
          </Nav>
        </Navbar.Body>
      </Navbar>

    </Header>

  )

}


class App extends React.Component {


  render() {

    return (
      <div className="mission-control-app">        
        <Container className="mc-main-container">
          
            <MySideBar/>
          
          <Container className="mc-inner-container">
            
              <MyHeader/>
            
            <Content className="mc-inner-content">

              bella secco
          

              <div style={{width: '250px', height: '250px', backgroundColor: 'red'}}></div>
              <div style={{width: '250px', height: '250px', backgroundColor: 'yellow'}}></div>
              <div style={{width: '250px', height: '250px', backgroundColor: 'green'}}></div>
              <div style={{width: '250px', height: '250px', backgroundColor: 'red'}}></div>
              <div style={{width: '250px', height: '250px', backgroundColor: 'yellow'}}></div>
              <div style={{width: '250px', height: '250px', backgroundColor: 'green'}}></div>

              <div className="title">sono ross</div> 

              <Button>Allora?</Button>

            </Content>
          </Container>
        </Container>
          
         
        
        
       





       

      

     
      </div>
    );
  }

}

export default App;