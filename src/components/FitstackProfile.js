import React, { Component } from "react"
import * as blockstack from "blockstack"
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride"
import DatePicker from "react-datepicker"
import { Form } from "react-bootstrap"
import { LineChart } from "react-chartkick"

import "react-datepicker/dist/react-datepicker.css"
import logo from "./../assets/fit_logo.png"
import "chart.js"

const GET_OPTIONS = {
  decrypt: true
}

const PUT_OPTIONS = {
  encrypt: true
}

export default class FitstackProfile extends Component {
  state = {
    weightLogs: [],
    loading: true,
    run: false,
    inputDate: '',
    inputUnits: 'Yes',
    inputWeight: '',
    stepIndex: 0, // a controlled tour
    steps: [
      {
        target: ".dash-header-text",
        content:
          "Welcome to the First Step! This app allows you to securely track your glucose levels and assess your risk for foot ulcers compared to your local demographics."
      },
      {
        target: ".dash-entry",
        content: "New logs can be added from the bottom input here."
      },
      {
        target: ".dash-add",
        content:
          "Adding an entry appends it to your existing log, managed by Blockstack's decentralized and permissioned network."
      },
      {
        target: ".dash-delete",
        content:
          "Deleting the table is irreversible and remove all entries. Only use this if you are certain you want to start over!"
      },
      {
        target: ".dash-chart",
        content:
          "We'll automatically plot your data over time as you add entries."
      },
      {
        target: ".dash-logout",
        content:
          "Logging out won't remove your data. It'll be saved so your can see it, save it, or make a new entry, the next time you visit!"
      }
    ],
  }

  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
    this.handleFeetChange = this.handleFeetChange.bind(this)
    this.showAdditional = this.showAdditional.bind(this)
    this.hideAdditional = this.hideAdditional.bind(this)
    this.saveWeight = this.saveWeight.bind(this)
    this.deleteList = this.deleteList.bind(this)
  }

  componentDidMount() {
    this.listWeight()
  }

  getLogFile = () => 'logs.json'

  handleDateChange(inputDate) {
    this.setState({inputDate})
  }

  handleFeetChange(inputFeet) {
  }

  showAdditional() {
    document.getElementById("reportAdditional").style.display = "block";
    document.getElementById("reportAdditional").scrollIntoView();
    this.setState({ [units]: 'Yes' })
  }

  hideAdditional() {
    document.getElementById("reportAdditional").style.display = "none";
    this.setState({ [units]: 'No' })
  }

  listWeight() {
    const self = this
    const { userSession, profile } = this.props
    let person = new blockstack.Person(profile)
    console.log("profile", person)

    userSession.getFile(self.getLogFile(), GET_OPTIONS).then(fileContents => {
      const weightLogs = JSON.parse(fileContents || "[]")
      console.log("fileContents of listWeight", fileContents)
      console.log("weights in listWeight", weightLogs)
      // set the tutorial to run if no logs are present.
      self.setState({ weightLogs, loading: false, run: true })
    })
  }

  saveWeight(event) {
    event.preventDefault()
    const self = this
    const { userSession } = this.props
    let { inputDate, inputWeight, inputUnits } = this.state
    if (document.getElementById('yes-radio').checked) {
      inputUnits = "Yes"
    } else {
      inputUnits = "No"
    }
    console.log(this.state)
    if (!inputDate || !inputWeight || !inputUnits) {
      alert('Weight, date, and units must all be specified to save record.')
      return
    }

    inputWeight = parseInt(inputWeight)

    if (isNaN(inputWeight) || inputWeight <= 0) {
      alert('Input weight must be positive')
      return
    }

    userSession.getFile(self.getLogFile(), GET_OPTIONS).then(fileContents => {
        // get the contents of the file /weights.txt
        const weights = JSON.parse(fileContents || "[]")
        console.log("old weights in saveWeight", weights)
        const weightLogs = [
          ...weights,
          {
            weight: inputWeight,
            date: inputDate,
            units: inputUnits
          }
        ]
        console.log("weight to be saved", weightLogs)
        userSession.putFile(self.getLogFile(), JSON.stringify(weightLogs), PUT_OPTIONS).then(() => {
          self.setState({weightLogs})
          self.clearInputs()
        })
      })
  }

  clearInputs() {
    this.setState({
      inputDate: '',
      inputWeight: '',
      inputUnits: 'Yes'
    })
  }

  deleteList(event) {
    const { userSession } = this.props
    event.preventDefault()
    userSession.deleteFile(this.getLogFile()).then(() => {
      this.listWeight()
    })
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  deleteLastItem() {
    const { userSession } = this.props
    const self = this
    userSession.getFile(self.getLogFile(), GET_OPTIONS).then(fileContents => {
      const weights = JSON.parse(fileContents || "[]")
      if (weights.length > 1) {
        weights.pop()
        console.log("after deleting last item", weights)

        userSession.putFile(self.getLogFile(), JSON.stringify(weights), PUT_OPTIONS).then(() => {
          self.listWeight(userSession)
        })
      } else if (weights.length === 1) {
        document.getElementById("weights").style.display = "none"
        document.getElementById("weight-body").innerHTML = ""
        userSession.putFile(self.getLogFile(), [], { decrypt: false }).then(() => {
          self.listWeight(userSession)
        })
      }
    })
  }

  handleJoyrideCallback = data => {
    const { action, index, status, type } = data

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      this.setState({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) })
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      this.setState({ run: false })
    }

    console.groupCollapsed(type)
    console.log(data) //eslint-disable-line no-console
    console.groupEnd()
  }

  render() {
    const { profile } = this.props
    let { weightLogs, run, stepIndex, inputDate, inputWeight, inputUnits, steps } = this.state
    weightLogs = weightLogs.map(log => {
      log.date = (new Date(log.date)).toISOString().split('T')[0]
      return log
    })

    let data = []
    let units = ""
    if (weightLogs && weightLogs.length > 0) {
      let points = []
      let max = 0

      units = weightLogs[0]["units"]

      weightLogs.forEach(log => {
        let w = log.weight
        const d = log.date
        const u = log.units
         if (u != units) {
            w *= 2.2
        }
        w = parseInt(w)
        if (w && d) {
          points.push([d, w])
          max = Math.max(max, w)
        }
      })



      data = {
        name: `Weight (${units})`,
        data: points,
        max: max
      }
    }

    return (
      <div>
        <Joyride
          callback={this.handleJoyrideCallback}
          continuous={true}
          getHelpers={this.getHelpers}
          run={run}
          scrollToFirstStep={true}
          showProgress={true}
          showSkipButton={true}
          stepIndex={stepIndex}
          steps={steps}
          styles={{
            options: {
              zIndex: 10000
            }
          }}
        />
        <div id="crypto-container">
          <div className="panel-landing" id="crypto">
            <div className="dash-chart">
              <LineChart
                legend={false}
                min={0}
                max={data['max']}
                data={data['data']}
                messages={{ empty: "Enter your first data point below!" }}
                ytitle="Reading"
                xtitle="Date"
              />
            </div>

            {/* Show existing data if present */}
            {weightLogs && weightLogs.length > 0 && (
              <div id="weights">
                <table className="table dash-table">
                  <thead className="thead-dark">
                    <tr>
                      <th>Fasting Glucose Level</th>
                      <th>Date</th>
                      <th>Foot Checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightLogs.map((row, i) => {
                      return <tr key={i}>
                        <td>{row.weight}</td>
                        <td>{row.date}</td>
                        <td>{row.units}</td>
                      </tr>
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <hr />

            <p className="dash-add-prompt">-<br/>Add a new glucose reading:</p>
            <table className="weight-table dash-entry">
              <tbody id="weight-body">
                <tr>
                  <td>
                    <div className="input-group mb-3">
                    <Form.Control 
                      value={inputWeight}
                      onChange={this.handleChange} 
                      name='inputWeight' 
                      type="number" 
                      placeholder="Enter glucose reading (ex. 104)"
                      className="a1c-input"
                    />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="input-group mb-3">
                      <DatePicker
                        className="date-picker form-control a1c-input"
                        placeholderText="Enter date"
                        selected={inputDate}
                        onChange={this.handleDateChange}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <p>Did you check your feet?</p>
                    <div className="feetRadio">
                        <label>
                          <input name="foot" type="radio" value="Yes" id="yes-radio" onClick={this.showAdditional} />
                          <span className="foot">Yes</span>
                        </label>
                        <label className="noFoot">
                          <input name="foot" type="radio" value="No" id="no-radio" onClick={this.hideAdditional} />
                          <span className="foot">No</span>
                        </label>
                    </div>
                </tr>
              </tbody>
            </table>

            
          </div>
        </div>
        <div id="deleteWeights">
          <div className="btn btn-primary dash-add" id="save-weight" onClick={this.saveWeight}>
            Add entry
          </div>
          &nbsp;
          <div className="btn btn-primary dash-delete" id="delete-button" onClick={this.deleteList}>
            Delete all
          </div>
          &nbsp;
        </div>
        <div id="reportAdditional">
          <p>Would you like to report anything?</p>
          <div className="btn btn-primary dash-add">
            Draw
          </div> &nbsp;
          <div className="btn btn-primary dash-add">
            Upload image
          </div> &nbsp;
          <div className="btn btn-primary dash-add">
            No
          </div> &nbsp;
        </div>

      </div>
    )
  }
}
