import React, { Component } from "react"
import * as blockstack from "blockstack"
import FitstackProfile from "./FitstackProfile";

import logo from './../assets/fit_logo.png'

const appConfig = new blockstack.AppConfig(['store_write', 'publish_data','email'])
const userSession = new blockstack.UserSession({ appConfig })

export default class Home extends Component {

  state = {
    profile: null 
  }

  componentDidMount() {
    if (userSession.isUserSignedIn()) {
      const profile = userSession.loadUserData().profile
      this.setState({profile})
      this.showProfile(profile)
     
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(userData => {
        window.location = window.location.origin
      })
    }
  }

  showProfile(profile) {
    document.getElementById("section-1").style.display = "none"
    document.getElementById("section-2").style.display = "block"
    document.getElementById("site-wrapper-inner").style.verticalAlign = "top"
  }

  signin(event) {
    event.preventDefault()
    userSession.redirectToSignIn()
  }

  signout(event) {
    event.preventDefault()
    userSession.signUserOut()
    window.location = window.location.origin
  }

  render() {
    const { profile } = this.state

    return (
      <div>
        <div className="panel-welcome hide" id="section-2">
          <p className="lead">
            <a
              href="#"
              className="btn btn-primary btn-lg dash-logout"
              id="signout-button"
              onClick={this.signout}>
              Logout
            </a>
          </p>
        </div>
        <div className="site-wrapper">
          <div className="site-wrapper-inner" id="site-wrapper-inner">
            <div className="panel-landing" id="section-1">
              {/* <h1 className="landing-heading">Fitness Stack</h1> */}
              <img className='landing-logo' src={logo}/>
              <p className="lead">
                <a
                  href="#"
                  className="btn btn-primary btn-lg"
                  id="signin-button"
                  onClick={this.signin}
                >
                  Sign In with Blockstack
                </a>
              </p>
            </div>
            {!profile && <div>
              <img src="https://i.giphy.com/media/26BRq9PYFLeJl3WLu/giphy.webp" />
              <p className='landing-slogan-text'>Share and record your weight loss progress, backed by <a href="https://blockstack.org" target="_blank">Blockstack</a> decentralized storage.</p>
            </div>}
            <div>
              {profile && <FitstackProfile profile={profile} userSession={userSession}/>}
            </div>
           </div>
        </div>
      </div>
    )
  }
}
